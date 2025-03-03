# 마탕화면 도우미 (Mabinogi foreground limiter)

게임 [마비노기](https://mabinogi.nexon.com)가 활성화된 상태가 아니라면 CPU 점유율을 낮춰줍니다.

## 다운로드

[릴리즈 페이지](https://github.com/izure1/mabinogi-foreground-limter/releases)에서 다운받을 수 있습니다.  
최신 버전의 Assets에서 `MFL-x.x.x.Setup.exe` 파일을 다운받아 설치해주세요.

## 기능

1. 성능을 제한하여 컴퓨터 성능 향상 및 전력 소모 감소
1. 매크로 지원
1. 기록용 스냅샷 지원
1. 경매장 검색 및 알리미 지원
1. 인게임 마우스 커서 강조 기능 지원

## 사용법

1. 설치 후 실행하세요.
1. 게임이 실행 중이면 자동으로 감지됩니다. 이후 **시작하기** 버튼을 누르세요.
1. **성능 제한** 기능을 사용하여 CPU를 얼마나 제한할 지 설정할 수 있습니다.

## 왜 사용하는가?

### 성능 향상

다른 작업을 하면서 마비노기를 바탕화면처럼 쓰시는 분들이 많습니다.  
하지만 마비노기는 오래된 게임이고, CPU를 많이 점유합니다. 성능을 제한할 도구가 필요합니다.

이 프로그램은 마비노기 활성화 상태를 감지하고, 사용 중이 아닐 때 CPU를 제한하여 컴퓨터 성능을 원활하게 만듭니다.

### 좀 더 쾌적한 플레이를 위한 매크로 지원

마비노기에서 **상태지원**, **볼트마법조합** 등, 일부 키조합이 필요한 요소를 위한 매크로는 회색지대에 놓여져 있습니다. 그러나 이러한 기능은 특정 게이밍 마우스 이용자들만 사용 가능하며, 그 외 분들은 상대적 불편함을 겪고 있습니다.

_본 프로그램은 특정 하드웨어/소프트웨어로 인한 상대적 불이익이 없도록 하기 위해, <u>그와 동등/비슷한 수준의 기능만을 지원</u>합니다. 따라서 그 이상은 지원하지 않습니다._

마비노기 공식 홈페이지의 [권장하지 않는 플레이 방식 안내](https://mabinogi.nexon.com/page/archive/guide_view.asp?id=4889849&num=8)를 준수해주세요.  
**개발자는 매크로 사용을 권장하지 않으며, 불이익으로 인한 책임은 본인의 몫입니다.**

### 스냅샷 기록

게임 플레이 도중, 일정 간격으로 스크린샷을 찍어 보관합니다.  
분쟁 시 증거 자료로 활용할 수 있습니다. 블랙박스처럼 활용하세요.

### 경매장 알리미

원하는 매물의 옵션을 상지정하면 일정 간격으로 경매장을 검색하여 알려줍니다.  
이는 [넥슨 OPEN API](https://openapi.nexon.com/ko/my-application/create-app/) 등록이 필요합니다.

### 인게임 마우스 커서 강조

마비노기 게임을 하다보면 커서가 사라지는 버그가 있습니다.  
이를 방지하기위해 커서 주변에 동그란 원을 그려넣어, 커서의 위치를 알려줍니다.

## 작동 원리는?

일정 간격으로 마비노기 프로세스를 일시정지/재개를 반복합니다.  
[BES](https://mion.yosei.fi/BES/)와 동작 원리는 같습니다. 다만 더 편리합니다.

## 테스트 환경

Windows 10, Windows 11에서 테스트를 완료했습니다.  
만일 오류를 발견하였다면, [이슈 게시판](https://github.com/izure1/mabinogi-foreground-limter/issues)을 이용하여 버그 제보를 해주세요.

## 알려진 문제

### 실행 시 **A JavaScript error occurred in the main process...** 오류 발생

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
1. 배포를 위해 `forge.config.ts` 파일을 수정합니다.  
**repository.owner** 값을 당신의 Github 아이디, **repository.name** 값을 저장소 이름으로 수정하세요.
1. `npm run publish` 명령어를 입력하여 배포하세요.
1. 저장소의 Release 페이지에서, draft된 버전을 실제로 배포하십시오.

## 라이센스

MIT 라이센스를 따릅니다.
