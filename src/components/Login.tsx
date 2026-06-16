import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Key, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Usuario } from '../types';
import { getSavedUsers } from '../utils/mockData';

interface LoginProps {
  onLoginSuccess: (user: Usuario) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    const users = getSavedUsers();
    const matchedUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

if (matchedUser) {
  console.log('Usuário encontrado:', matchedUser);
  console.log('Senha digitada:', password);
  console.log('Senha cadastrada:', matchedUser.senha);

  if (password === matchedUser.senha) {
    onLoginSuccess(matchedUser);
  } else {
    setError('Senha incorreta.');
  }
} else {
  setError('E-mail não cadastrado.');
}
  };

  const handleForgot = () => {
    if (!email) {
      setError(
        'Digite seu e-mail no campo acima primeiro para solicitar a redefinição.'
      );
      return;
    }

    setForgotSent(true);
    setError(null);

    setTimeout(() => {
      setForgotSent(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center p-3 bg-blue-900 text-white rounded-2xl shadow-lg mb-4"
        >
          <Shield className="w-10 h-10 text-yellow-400" />
        </motion.div>

        <h2 className="text-3xl font-extrabold tracking-tight text-blue-950">
          OCLE SAFETY
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Digitalização e Gestão de Inspeções de Segurança Elétrica
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 text-sm text-red-700 flex items-start gap-2 rounded">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {forgotSent && (
              <div className="bg-green-50 border-l-4 border-green-500 p-3 text-sm text-green-700 rounded">
                E-mail de redefinição enviado com sucesso para{' '}
                <strong>{email}</strong>.
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700">
                E-mail Corporativo
              </label>

              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ocle.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Senha de Acesso
              </label>

              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-400" />
                </div>

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-slate-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-900 border-slate-300 rounded"
                />

                <label
                  htmlFor="remember_me"
                  className="ml-2 block text-sm text-slate-700"
                >
                  Lembrar-me
                </label>
              </div>

              <button
                type="button"
                onClick={handleForgot}
                className="text-sm font-medium text-blue-900 hover:text-blue-800"
              >
                Esqueci minha senha
              </button>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md text-white bg-blue-900 hover:bg-blue-950 font-semibold"
            >
              Entrar no Sistema
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
