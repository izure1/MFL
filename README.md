# 마탕화면 도우미 (Mabinogi foreground limiter)

게임 [마비노기](https://mabinogi.nexon.com)가 활성화된 상태가 아니라면 CPU 점유율을 낮춰줍니다.

## 다운로드

[릴리즈 페이지](https://github.com/izure1/mabinogi-foreground-limter/releases)에서 다운받을 수 있습니다.

## 사용법

1. 압축 해제 후, **mabinogi-foreground-limiter.exe** 프로그램을 관리자 권한으로 실행하세요.  
2. 게임이 실행 중이면 자동으로 감지됩니다. 이후 **시작하기** 버튼을 누르세요.
3. **성능 제한** 기능을 사용하여 CPU를 얼마나 제한할 지 설정할 수 있습니다.

## 왜 사용하는가?

다른 작업을 하면서 마비노기를 바탕화면처럼 쓰시는 분들이 많습니다.  
하지만 마비노기는 오래된 게임이고, CPU를 많이 점유합니다. 성능을 제한할 도구가 필요합니다.

이 프로그램은 마비노기 활성화 상태를 감지하고, 사용 중이 아닐 때 CPU를 제한하여 컴퓨터 성능을 원활하게 만듭니다.

## 작동 원리는?

일정 간격으로 마비노기 프로세스를 일시정지/재개를 반복합니다. [BES](https://mion.yosei.fi/BES/)와 같습니다.

## 테스트 환경

Windows 10, Windows 11에서 테스트를 완료했습니다.  
만일 오류를 발견하였다면, [이슈 게시판](https://github.com/izure1/mabinogi-foreground-limter/issues)을 이용하여 버그 제보를 해주세요.

## 직접 빌드하고 싶다면?

1. 소스코드를 다운받으세요.
2. 명령줄에 `npm run package`를 입력하세요.
3. 빌드된 결과물이 `out` 디렉토리에 출력됩니다.

## 라이센스

MIT 라이센스를 따릅니다.
