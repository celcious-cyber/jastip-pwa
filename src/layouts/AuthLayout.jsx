import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#FA4F82] to-[#942E4D] flex flex-col items-center justify-center p-6 font-poppins text-white">
      <div className="w-full max-w-sm flex flex-col items-center flex-grow justify-center">
        <Outlet />
      </div>
      <footer className="mt-8 text-center opacity-70">
        <p className="text-[10px]">Powered By Celcious Studio</p>
      </footer>
    </div>
  );
};

export default AuthLayout;