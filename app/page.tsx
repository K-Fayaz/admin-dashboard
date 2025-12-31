"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username')?.toString().trim() || '';
    const password = formData.get('password')?.toString() || '';

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || 'Login failed');
        return;
      }

      localStorage.setItem('token', result.token);
      localStorage.setItem('role', result.role);

      if (result.role === 'admin') {
        router.push('/admin');
      } else {
        alert('you are not admin');
      }
    } catch (error) {
      console.error('Login error', error);
      alert('Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-md px-6">
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-zinc-900">
          <h1 className="mb-6 text-center text-2xl font-semibold text-black dark:text-zinc-50">
            Login
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-black shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-400"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-black shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-400"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-foreground px-4 py-2 text-base font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Submit
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
