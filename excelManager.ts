import xl from 'excel4node';

export class ExcelManager {

  public static getCellStyle(fgColor: string, wb){
    let cellStyle = wb.createStyle({
      alignment: {
        horizontal: 'left',
        vertical: 'center'
      },
      border: {
        left : {
          style: 'thin',
          color: '000000'
        },
        right : {
          style: 'thin',
          color: '000000'
        },
        top : {
          style: 'thin',
          color: '000000'
        },
        bottom : {
          style: 'thin',
          color: '000000'
        }
      },
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: fgColor
      },
    });

    return cellStyle;
  }

  public static createDocument(records: object[]){
    // Create a new instance of a Workbook class
    var wb = new xl.Workbook();
    
    // Add Worksheets to the workbook
    var ws = wb.addWorksheet('칼럼 정의서');

    let titleStyle = wb.createStyle({
      alignment: {
        horizontal: 'center',
        vertical: 'center'
      },
      font: {
        bold: true
      },
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: 'ffc000'
      },
      border: {
        left : {
          style: 'thin',
          color: '000000'
        },
        right : {
          style: 'thin',
          color: '000000'
        },
        top : {
          style: 'thin',
          color: '000000'
        },
        bottom : {
          style: 'thin',
          color: '000000'
        }
      }
    });

    let cellStyle = this.getCellStyle('ffffff', wb);

    // Set value of cell A1 to 100 as a number type styled with paramaters of style
    ws.cell(1, 1).string('DB명').style(titleStyle);
    ws.column(1).setWidth(15);
    ws.cell(1, 2).string('테이블명').style(titleStyle);
    ws.column(2).setWidth(23);
    ws.cell(1, 3).string('순번').style(titleStyle);
    ws.column(3).setWidth(5);
    ws.cell(1, 4).string('칼럼명').style(titleStyle);
    ws.column(4).setWidth(16);
    ws.cell(1, 5).string('칼럼설명').style(titleStyle);
    ws.column(5).setWidth(24);
    ws.cell(1, 6).string('NULL 허용').style(titleStyle);
    ws.column(6).setWidth(7);
    ws.cell(1, 7).string('데이터 타입').style(titleStyle);
    ws.column(7).setWidth(13);
    ws.cell(1, 8).string('데이터 길이').style(titleStyle);
    ws.column(8).setWidth(15);
    ws.cell(1, 9).string('KEY').style(titleStyle);
    ws.column(9).setWidth(7);
    ws.cell(1, 10).string('자동여부').style(titleStyle);
    ws.column(10).setWidth(15);
    ws.cell(1, 11).string('디폴트값').style(titleStyle);
    ws.column(11).setWidth(20);

    ws.row(1).setHeight(40);

    const recordSize = records.length;

    let lastTableName: string = '';
    let startRow: number = 0;
    let endRow: number = 0;

    let lastDbName: string = '';
    let startDbRow: number = 0;
    let endDbRow: number = 0;

    for(let i=0;i<recordSize;i++){
      let record = records[i];
      const row = i + 2;

      if(lastDbName === record['DB명']){
        endDbRow++;
      }
      else{
        if(startDbRow !== endDbRow){
          ws.cell(startDbRow, 1, endDbRow, 1, true).string(lastDbName).style(cellStyle);
        }
        else{
          ws.cell(row, 1).string(lastDbName).style(cellStyle);
        }
        lastDbName = record['DB명'];
        startDbRow = row;
        endDbRow = row;
      }
      ws.cell(row, 1).string(record['DB명']).style(cellStyle);


      if(lastTableName === record['테이블명']){
        endRow++;
      }
      else{
        if(startRow !== endRow){
          ws.cell(startRow, 2, endRow, 2, true).string(lastTableName).style(cellStyle);
        }
        else{
          ws.cell(row, 2).string(lastTableName).style(cellStyle);
        }
        lastTableName = record['테이블명'];
        startRow = row;
        endRow = row;
      }
      ws.cell(row, 2).string(record['테이블명']).style(cellStyle);


      ws.cell(row, 3).number(record['순번']).style(cellStyle);
      ws.cell(row, 4).string(record['칼럼명']).style(cellStyle);
      ws.cell(row, 5).string(record['칼럼설명']).style(cellStyle);

      const nullAccept = record['NULL값 여부'];
      if(nullAccept === 'YES'){
        ws.cell(row, 6).string(record['NULL값 여부']).style(this.getCellStyle('dce6f1', wb));
      }
      else if(nullAccept === 'NO'){
        ws.cell(row, 6).string(record['NULL값 여부']).style(this.getCellStyle('ffcccc', wb));
      }
      else {
        ws.cell(row, 6).string(record['NULL값 여부']).style(cellStyle);
      }

      ws.cell(row, 7).string(record['데이터 타입']).style(cellStyle);
      ws.cell(row, 8).string(record['데이터 길이']).style(cellStyle);

      const keyType = record['KEY'];
      if(keyType === 'PRI'){
        ws.cell(row, 9).string(record['KEY']).style(this.getCellStyle('ffcccc', wb));
      }
      else if(keyType === 'UNI'){
        ws.cell(row, 9).string(record['KEY']).style(this.getCellStyle('dce6f1', wb));
      }
      else if(keyType === 'MUL'){
        ws.cell(row, 9).string(record['KEY']).style(this.getCellStyle('e4f7d7', wb));
      }
      else {
        ws.cell(row, 9).string(record['KEY']).style(cellStyle);
      }
      ws.cell(row, 10).string(record['자동여부']).style(cellStyle);
      let defaultValue = record['디폴트값'];
      ws.cell(row, 11).string((typeof(defaultValue) === 'object') ? '' : defaultValue).style(cellStyle);
    }

    if(startDbRow !== endDbRow){
      ws.cell(startDbRow, 1, endDbRow, 1, true).string(lastDbName).style(cellStyle);
    }

    if(startRow !== endRow){
      ws.cell(startRow, 2, endRow, 2, true).string(lastTableName).style(cellStyle);
    }
    
    wb.write(`칼럼 정의서.xlsx`);
  }
}