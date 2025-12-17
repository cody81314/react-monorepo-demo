import NxWelcome from './pages/nx-welcome/nx-welcome';
import GameTable from './pages/game-table/game-table';
import SignInScreen from './components/sign-in-screen';

import { Route, Routes, Link } from 'react-router-dom';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from './components/firebase-config';

export function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // --- 這裡可以看到使用者資訊 ---
        console.log('User UID:', currentUser.uid);
        console.log('Is Anonymous?', currentUser.isAnonymous); // 重點：判斷是否為匿名
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!user) return <SignInScreen />;

  return (
    <div>
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        {/* 根據是否為匿名，顯示不同內容 */}
        {user.isAnonymous ? (
          <h1>歡迎, 訪客 (Guest)</h1>
        ) : (
          <h1>歡迎回來, {user.displayName}</h1>
        )}

        <p>您的 User ID: {user.uid}</p>

        {/* 匿名使用者通常沒有 Email 和 照片，所以要用條件渲染 */}
        {user.email && <p>Email: {user.email}</p>}

        <button onClick={() => signOut(auth)}>登出</button>
      </div>
      <GameTable />
      <NxWelcome title="@react-monorepo-demo/react-monorepo-demo" />

      {/* START: routes */}
      {/* These routes and navigation have been generated for you */}
      {/* Feel free to move and update them to fit your needs */}
      <br />
      <hr />
      <br />
      <div role="navigation">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/page-2">Page 2</Link>
          </li>
        </ul>
      </div>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              This is the generated root route.{' '}
              <Link to="/page-2">Click here for page 2.</Link>
            </div>
          }
        />
        <Route
          path="/page-2"
          element={
            <div>
              <Link to="/">Click here to go back to root page.</Link>
            </div>
          }
        />
      </Routes>
      {/* END: routes */}
    </div>
  );
}

export default App;
