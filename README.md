# !! 비인가 주의사항 !!

**현재 마탕화면 도우미는 비인가 프로그램으로 등록된 것으로 추측되는 이슈가 있습니다. 관련 내용으로 문의가 진행 중이고, 그 이전까지는 사용을 자제해주시길 바랍니다.**

https://arca.live/b/mabi/149536452?mode=best&p=1

https://arca.live/b/mabi/149539649?mode=best&p=1


# 마탕화면 도우미 - MFL

[홈페이지](https://mfl.izure.org) 참조

## 테스트 환경

Windows 10, Windows 11에서 테스트를 완료했습니다.  
만일 오류를 발견하였다면, [이슈 게시판](https://github.com/izure1/mabinogi-foreground-limter/issues)을 이용하여 버그 제보를 해주세요.

## 알려진 문제

### 실행 시 **A JavaScript error occurred in the main process...** 오류 발생

데이터베이스 파일이 깨짐으로써 발생하는 오류로 추정됩니다.

```text
A JavaScript error occurred in the main process
Uncaught Exception:
SyntaxError: Unexpected token '
```

위 메세지가 뜨면서 에러가 발생하는 경우가 있습니다.  
아래 순서를 따라 해결할 수 있습니다.

1. **window+R**키를 눌러 **%USERPROFILE%** 입력하십시오.
1. 사용자 디렉토리 내에 **MFL** 폴더를 삭제하세요.
1. 재실행하시면 정상적으로 작동합니다.

### 실행 시 **Error [ERR_MODULE_NOT_FOUND]: Cannot find package...** 오류 발생

오류가 있는 버전으로 자동 업데이트되어 발생한 오류로 추정됩니다.

```text
A JavaScript error occurred in the main process

[Content]
Uncaught Exception:
Error [ERR_MODULE_NOT_FOUND]: Cannot find package...
```

위 메세지가 뜨면서 에러가 발생하는 경우가 있습니다.  
아래 순서를 따라 해결할 수 있습니다.

1. **window+R**키를 눌러 **%appdata%..\\..\\Local** 입력하십시오.
1. 디렉토리 내에 **MFL** 폴더를 삭제하세요.
1. [홈페이지](https://mfl.izure.org)에서 최신 버전을 다시 받아주세요.
1. 재설치하시면 정상적으로 작동합니다.

### Windows 11에서 설치 앱이 바탕화면에 추가되지 않는 오류

원인 파악 중에 있습니다.

### 설치파일 실행 후 아무런 반응도 없는 오류

백신 프로그램의 오작동으로 추정됩니다. 백신 프로그램을 끄고 재실행해보세요.

## 직접 빌드하고 싶다면?

1. 소스코드를 다운받으세요.
1. 명령줄에 `npm install`를 입력하세요.
1. 명령줄에 `npm run package`를 입력하세요.
1. 빌드된 결과물이 `out` 디렉토리에 출력됩니다.

### 새로운 저장소에 배포하기

만일 포크하여 새로운 저장소로 퍼블리시 하고 싶다면 다음 순서를 따르세요.

1. 소스코드를 다운받으세요.
1. [Github 토큰 생성 방법](https://www.electronjs.org/docs/latest/tutorial/tutorial-publishing-updating)을 참고하여 **Github Token** 생성하세요.
1. 다운받은 소스코드 디렉토리 루트에 **.env** 파일을 생성합니다.  
파일에 `GITHUB_TOKEN=your-token`을 기입하세요.  
1. 배포를 위해 `forge.config.cts` 파일을 수정합니다.  
**repository.owner** 값을 당신의 Github 아이디, **repository.name** 값을 저장소 이름으로 수정하세요.
1. `npm run publish` 명령어를 입력하여 배포하세요.
1. 저장소의 Release 페이지에서, draft된 버전을 실제로 배포하십시오.
