[목적]
* server.json에 입력된 DB 서버에 생성된 DB 들의 테이블 칼럼 정의서를 생성하여 엑셀 파일로 저장합니다.

[입력]
.\TableDefiner.exe <DB명1> <DB명2> ...

[예시]
.\TableDefiner.exe vms vms_log

[주의사항]
* 본 프로그램을 MariaDB에서 동작합니다.
* DB 서버가 로컬에 없을 경우 server.json의 DB 정보를 수정바랍니다.