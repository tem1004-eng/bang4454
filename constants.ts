// FIX: Removed invalid characters/lines from the start and end of the file.
import { Page } from './types';

const defaultStyles = {
  fontFamily: "Arial",
  fontSize: 18,
  fontWeight: 'normal' as 'normal',
  color: '#000000',
};

export const INITIAL_PAGES: Page[] = [
  {
    id: 1,
    imageUrl: 'https://storage.googleapis.com/aistudio-hosting/workspace-storage/e616238b-f288-4660-844c-9dd64d27d704/image.png',
    fields: [
      { id: '1-op', value: `SIG<br>안녕하세요?<br>즐거운 월요일에 인사드립니다.<br>‘방송은 나의기쁨' 구미은혜로교회 백성현목삽니다.<br>F.I, FO<br>샬롬! 축복합니다.`, top: '5%', left: '5%', width: '90%', height: '19%', placeholder: 'op 멘트...', ...defaultStyles },
      { id: '1-new-ment', value: '', top: '25%', left: '5%', width: '90%', height: '40%', placeholder: '멘트...', ...defaultStyles },
      { id: '1-opening', value: `방송은 나의 기쁨<br>월요일 순서, 시작하겠습니다~`, top: '66%', left: '5%', width: '90%', height: '6%', placeholder: '오프닝 멘트...', ...defaultStyles },
      { id: '1-praise', value: '은혜로운 찬양으로 함께 합니다.<br>1) 찬송가 // <br>2) 찬  양 // ', top: '73%', left: '5%', width: '90%', height: '10%', placeholder: '찬양 멘트...', ...defaultStyles },
    ],
  },
  {
    id: 2,
    imageUrl: 'https://storage.googleapis.com/aistudio-hosting/workspace-storage/1e8d9047-920f-48d5-b6ca-c9d2fbbd8f28/image.png',
    fields: [
      { id: '2-ment-1', value: `SIG<br>여러분께서는 지금 FM 91.9 MHz, 구미 105.9 MHz, 대구극동방송<br>구미본부에서 보내드리고 있는 ‘방송은 나의기쁨'과 함께하고 계십니다.<br>저는 구미은혜로교회 백성현목사입니다.`, top: '5%', left: '5%', width: '90%', height: '10%', placeholder: '멘트...', ...defaultStyles },
      { id: '2-new-ment', value: '', top: '16%', left: '5%', width: '90%', height: '15%', placeholder: '멘트...', ...defaultStyles },
    ],
  },
  {
    id: 3,
    imageUrl: 'https://storage.googleapis.com/aistudio-hosting/workspace-storage/72791e84-18e0-4786-89d5-a8e5621d960a/image.png',
    fields: [
      { id: '3-ment-1', value: `그리고 이따 들으실 선산제일교회 박태경 목사님의 추천찬양이 있는데<br>질문을 먼저 한번 드리려고 합니다 ~<br>--><br><br>오늘 추천 찬양은 정답이 무엇까요?<br>^^ 한번 생각해 보시구요 ~<br>정답을 아시는 분은 샵0191 혹은 우물정영원구원 번으로 문자 주시면 되겠습니다<br>'방송은 나의기쁨' 사연참여방법 들으시고 돌아오겠습니다.`, top: '5%', left: '5%', width: '90%', height: '40%', placeholder: '멘트...', ...defaultStyles },
      { id: '3-praise', value: '은혜로운 찬양으로 함께 합니다.<br>1) 찬&nbsp;&nbsp;&nbsp;&nbsp;양<br>2) 찬송가', top: '46%', left: '5%', width: '90%', height: '10%', placeholder: '찬양 멘트...', ...defaultStyles },
    ],
  },
  {
    id: 4,
    imageUrl: 'https://storage.googleapis.com/aistudio-hosting/workspace-storage/72791e84-18e0-4786-89d5-a8e5621d960a/image.png',
    fields: [
      { id: '4-prayer', value: `SIG<br>대구,경북 성시화를 위한 기도,<br>오늘은 연흥교회 박영구목사님께서 함께 기도해 주시겠습니다.`, top: '5%', left: '5%', width: '90%', height: '9%', placeholder: '기도...', ...defaultStyles },
      { id: '4-corner-1', value: `↗SIG↘<br>여러분께서는 지금 대구 FM 91.9 MHz, 구미 105.9 MHz 대구극동방송<br>구미본부에서 보내드리고 있는 ‘방송은 나의기쁨'과 함께하고 계십니다.`, top: '15%', left: '5%', width: '90%', height: '10%', placeholder: '주간코너 멘트...', ...defaultStyles },
      { id: '4-corner-2', value: `이 시간은 지난 주 찬양 퀴즈 정답과<br>문자 참여해 주신 분들을 소개하겠습니다.<br>‘목사님의 추천찬양’지난주 찬양퀴즈는<br>--><br><br>네 정답은 1번(  )이였습니다.<br>(정답문자 보내주신 분들 소개하겠습니다)`, top: '26%', left: '5%', width: '90%', height: '18%', placeholder: '주간코너 멘트...', ...defaultStyles },
      { id: '4-sms-participation', value: '문자참여~', top: '45%', left: '5%', width: '90%', height: '5%', placeholder: '문자 참여 멘트...', ...defaultStyles },
    ],
  },
  {
    id: 5,
    imageUrl: 'https://storage.googleapis.com/aistudio-hosting/workspace-storage/72791e84-18e0-4786-89d5-a8e5621d960a/image.png',
    fields: [
      { id: '5-copied-sms', value: '문자참여~', top: '5%', left: '5%', width: '90%', height: '5%', placeholder: '문자 참여 멘트...', ...defaultStyles },
      { id: '5-main', value: `오늘 선물은 정답 문자를 보내주신<br>[   ]번님 [   ]번님 [   ]번님 (     )분께 선물 보내 드리겠습니다.<br><br>#0191번으로 선물받으실 주소 남겨주시기 바랍니다.`, top: '11%', left: '5%', width: '90%', height: '15%', placeholder: '내용...', ...defaultStyles },
      { id: '5-sg', value: `*** =><br>이 시간은 방송선물로 함께 도와주시는 귀한 믿음의 기업들 소개하겠습니다.`, top: '27%', left: '5%', width: '90%', height: '6%', placeholder: 'SG 멘트...', ...defaultStyles },
    ],
  },
  {
    id: 6,
    imageUrl: 'https://storage.googleapis.com/aistudio-hosting/workspace-storage/083f2343-6c8c-4f10-b30f-06d99ab8c339/image.png',
    fields: [
      { id: '6-corner', value: `↗SIG↘ ‘방송은 나의 기쁨’ 매주 월요일은 은혜로운 이야기와 찬양으로 함께 하는 시간입니다. 오늘도 선산제일교회 박태경 목사님과 함께 하겠습니다.<br><br># 목사님의 추천찬양 / 선산제일교회 박태경 목사<br><br>↗SIG↘ ‘목사님의 추천찬양’ 지금까지 선산제일교회 박태경 목사님께서 수고해 주셨습니다.<br><br>오늘의 찬양퀴즈는`, top: '5%', left: '5%', width: '90%', height: '40%', placeholder: '주간코너 멘트...', ...defaultStyles },
      { id: '6-spot', value: '--><br><br>네 ~', top: '46%', left: '5%', width: '90%', height: '8%', placeholder: '스폿...', ...defaultStyles },
      { id: '6-bm', value: `찬양 퀴즈&nbsp;&nbsp;&nbsp;&nbsp;정답을 아시는 분은<br>대구극동방송 구미본부 :&nbsp;&nbsp;&nbsp;<br>샵, 영일구일,&nbsp;&nbsp;우물정 영원구원 번으로 퀴즈 정답 보내주시기 바랍니다.<br><br>퀴즈정답과 선물받으실 분은 다음주 이시간에 발표하겠습니다.<br>여러분의 많은 참여 바랍니다~`, top: '55%', left: '5%', width: '90%', height: '15%', placeholder: 'BM...', ...defaultStyles },
      { id: '6-praise', value: `# 은혜로운 찬양으로 함께 합니다`, top: '71%', left: '5%', width: '90%', height: '4%', placeholder: '찬양...', ...defaultStyles },
    ],
  },
  {
    id: 7,
    imageUrl: 'https://storage.googleapis.com/aistudio-hosting/workspace-storage/705eb552-67aa-4251-9ff2-789a7a1c97a5/image.png',
    fields: [
      { id: '7-closing-1', value: `SIG<br>대구 FM 91.9 MHz, 구미 105.9 MHz 대구극동방송<br>구미본부에서 보내드린‘방송은 나의기쁨'마칠 시간이 됐습니 다.`, top: '5%', left: '5%', width: '90%', height: '8%', placeholder: '클로징 멘트...', ...defaultStyles },
      { id: '7-new-box', value: '', top: '14%', left: '5%', width: '90%', height: '15%', placeholder: '멘트~', ...defaultStyles },
      { id: '7-closing-2', value: `방송은 나의기쁨 지금까지 제작에 김정헌 PD,
진행에 구미은혜로교회 백성현 목사였습니다.

극동방송을 듣게 하세요 / 기적이 일어납니다 /
우리는 지금 / 생명을 전하고 있습니다.`, top: '30%', left: '5%', width: '90%', height: '15%', placeholder: '클로징 멘트...', ...defaultStyles },
    ],
  },
];