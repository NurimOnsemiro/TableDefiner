import {MariaDbManager} from './mariaDbManager';
import {ExcelManager} from './excelManager';

async function main(){
    let dbManager = MariaDbManager.getInstance();

    let dbList: string[] = [];
    for(let i=2;i<process.argv.length;i++){
        dbList.push(process.argv[i]);
    }
    if(dbList.length === 0){
        console.error('Example) .\\TableDefiner.exe <db_name1> <db_name2> ...');
        process.exit(0);
    }
    let dbDataList: object[] = [];

    try{
        for(let dbName of dbList){
            let result = await dbManager.getDbTableDef(dbName);
            for(let record of result){
                record['DB명'] = dbName;
                dbDataList.push(record);
            }
            console.log(`Collect ${dbName} record FINISH`);
        }
        ExcelManager.createDocument(dbDataList);
        console.log('DONE!');
    }catch(ex){
        console.error(ex);
    }
}
main();