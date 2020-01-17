import mariadb from 'mariadb';
import fs from 'fs';
import path from 'path';
import moment from 'moment';

export interface DbInitQuery {
  index: number;
  name: string;
  query: string;
}

export interface DbInit {
  description: string;
  queries: DbInitQuery[];
}

export class MariaDbManager {
  private pool: mariadb.Pool;

  private static instance: MariaDbManager = new MariaDbManager();

  private constructor() {}

  public static getInstance() {
    if (this.instance === undefined) {
      this.instance = new MariaDbManager();
    }
    return this.instance;
  }

  public async getDbTableDef(dbName: string) {
    /*------------------------START 함수정의------------------------*/
    /*------------------------END 함수정의------------------------*/

    let serverInfo: object;
    serverInfo = JSON.parse(fs.readFileSync('./server.json').toString('utf8'));
    if(serverInfo['DB_HOST'] === undefined) throw new Error('DB_HOST not exist');
    if(serverInfo['DB_USER'] === undefined) throw new Error('DB_USER not exist');
    if(serverInfo['DB_PASS'] === undefined) throw new Error('DB_PASS not exist');

    let conn = await mariadb.createConnection({
      host: serverInfo['DB_HOST'],
      user: serverInfo['DB_USER'],
      password: serverInfo['DB_PASS'],
    });

    let result: object[] = [];

     try {
      // INFO: ism 데이터베이스를 생성한다
      let query: string =  `SELECT a.TABLE_NAME '테이블명', b.ORDINAL_POSITION '순번', b.COLUMN_NAME '칼럼명', b.DATA_TYPE '데이터 타입', b.COLUMN_TYPE '데이터 길이', b.COLUMN_KEY 'KEY', b.IS_NULLABLE 'NULL값 여부', b.EXTRA '자동여부', b.COLUMN_DEFAULT '디폴트값', b.COLUMN_COMMENT '칼럼설명' 
      FROM information_schema.TABLES a 
      JOIN information_schema.COLUMNS b ON a.TABLE_NAME = b.TABLE_NAME AND a.TABLE_SCHEMA = b.TABLE_SCHEMA 
      WHERE a.TABLE_SCHEMA = '${dbName}' 
      ORDER BY a.TABLE_NAME, b.ORDINAL_POSITION`;

      result = await conn.query(query);
    } catch (ex) {
      console.error(ex);
    }finally {
      await conn.destroy();
    }

    return result;
  }

  // INFO: 쿼리 실행 함수
  public async executeQuery(query: string, param: any[]): Promise<object> {
    /*------------------------START 함수정의------------------------*/
    /*------------------------END 함수정의------------------------*/

    let connection: mariadb.PoolConnection;
    let result: object = [];

    try {
      // STEP 1: DB 커넥션 획득
      connection = await this.pool.getConnection();

      // STEP 2: 각 쿼리 실행
      result = await connection.query(query, param);

      // STEP 3: DB 커넥션 반환
      connection.release();
    } catch (ex) {
      // INFO: 오류가 발생해도 커넥션은 해제해야 한다
      if (connection !== undefined) {
        connection.release();
      }
      console.error(ex);
      return result;
    }

    return result;
  }

  // INFO: 삽입 쿼리 자동 생성 함수
  public makeInsertQuery(tableName: string, param: object): string {
    if (Object.keys(param).length === 0) {
      return '';
    }
    let query: string;
    query = `INSERT INGORE INTO ${tableName} SET`;
    for (let key in param) {
      query += ` ${key}=?,`;
    }
    // INFO: 마지막 쉼표 문자를 제거한다
    query = query.substr(0, query.length - 1);
    return query;
  }

  // INFO: 갱신 쿼리 자동 생성 함수
  public makeUpdateQuery(tableName: string, param: object, primaryKey: string): string {
    if (Object.keys(param).length === 0) {
      return '';
    }
    let query: string;
    query = `UPDATE ${tableName} SET`;
    for (let key in param) {
      query += ` ${key}=?,`;
    }
    query += ` mod_time = now(3)`;
    query += ` where ${primaryKey}=?`;

    return query;
  }

  // INFO: 삽입 쿼리 수행 함수
  public async insertCommon(tableName: string, param: object): Promise<object> {
    let query = this.makeInsertQuery(tableName, param);
    if (query.length === 0) {
      throw new Error('Query parameter is not valid');
    }
    let paramArr: any[] = [];
    for (let key in param) {
      paramArr.push(param[key]);
    }

    let result: object;
    result = await this.executeQuery(query, paramArr);
    return result;
  }

  // INFO: 업데이트 쿼리 수행 함수
  public async updateCommon(tableName: string, param: object, primaryKey: string): Promise<object> {
    let query = this.makeUpdateQuery(tableName, param, 'id');
    if (query.length === 0) {
      throw new Error('Query parameter is not valid');
    }
    let paramArr: any[] = [];
    for (let key in param) {
      paramArr.push(param[key]);
    }
    paramArr.push(primaryKey);

    let result: object;
    result = await this.executeQuery(query, paramArr);
    return result;
  }
}
