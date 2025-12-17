import { auth } from './firebase-config'; // 匯入剛剛建立的 auth 實體
import {
  GoogleAuthProvider,
  signInAnonymously,
} from 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import 'firebaseui/dist/firebaseui.css'; // 務必引入 CSS！

// FirebaseUI 的設定物件
const uiConfig = {
  // 登入流程：'popup' (跳出視窗) 或 'redirect' (頁面跳轉)
  signInFlow: 'popup',

  // 登入成功後的轉址 URL (若使用 'popup' 且有處理 onAuthStateChanged，這行通常可選)
  signInSuccessUrl: '/',

  // 要啟用的登入選項
  signInOptions: [
    GoogleAuthProvider.PROVIDER_ID
    // 你可以在這裡加入 Facebook, GitHub, Phone 等其他 Provider
  ],

  // 為了避免 React Strict Mode 重複渲染導致的問題 (React 18+)
  callbacks: {
    signInSuccessWithAuthResult: () => false, // 避免自動轉址，讓 React 處理狀態
  },
};

function SignInScreen() {
  // 2. 定義匿名登入的函式
  const handleGuestLogin = async () => {
    try {
      await signInAnonymously(auth);
      // 登入成功後，App.js 的 onAuthStateChanged 會自動偵測到，不需要手動轉址
      console.log('訪客登入成功');
    } catch (error) {
      console.error('訪客登入失敗:', error);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>登入頁面</h1>
      <p>請選擇以下方式登入：</p>

      {/* 既有的 FirebaseUI (Google/Email) */}
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />

      {/* 分隔線 */}
      <div style={{ margin: '20px 0', borderTop: '1px solid #ccc' }}></div>

      {/* 3. 手動新增的「訪客登入」按鈕 */}
      <p>不想註冊？</p>
      <button
        onClick={handleGuestLogin}
        style={{
          padding: '10px 20px',
          backgroundColor: '#6c757d', // 灰色按鈕
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        以訪客身分繼續
      </button>
    </div>
  );
}

export default SignInScreen;
