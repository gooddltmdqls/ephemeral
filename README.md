# ephemeral
백업과 복구를 도와주는 간편한 툴

## 설치
```sh
npm i -g @icetang0123/ephemeral
```

또는

```sh
npm i -g https://github.com/gooddltmdqls/ephemeral
```

## 사용법
`ephemeral --help`를 통해 모든 명령어를 확인할 수 있습니다.

### 백업
```sh
ephemeral backup (이름)
```

지정한 이름으로 백업 파일을 생성합니다.

#### --force
같은 이름으로 저장된 백업 파일이 있을 경우, 묻지 않고 덮어씌웁니다.

### 복구
```sh
ephemeral restore (이름)
```

지정된 이름의 백업 파일을 불러옵니다.

#### --force
현재 폴더에 파일이 있을 경우, 묻지 않고 덮어씌웁니다.

#### --delete
복구 후 백업 파일을 삭제합니다.