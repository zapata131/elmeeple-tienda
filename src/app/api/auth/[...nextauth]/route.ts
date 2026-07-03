import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@/lib/supabaseServer';
interface CustomUser {
  id: string;
  role?: string;
  email?: string | null;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Correo', type: 'email', placeholder: 'ejemplo@meepleprecios.com' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const emailClean = credentials.email.toLowerCase().trim();

        try {
          // Initialize Server-Side Supabase client
          const supabase = await createClient();

          // Authenticate with Supabase Auth
          const { data, error } = await supabase.auth.signInWithPassword({
            email: emailClean,
            password: credentials.password,
          });

          if (error || !data.user) {
            console.error('[NextAuth] Supabase auth failure:', error?.message);
            return null;
          }

          // Fetch the user's role from the public profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (profileError || !profile) {
            console.error('[NextAuth] Failed to load user profile role:', profileError?.message);
            // Fallback to default player role
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.email?.split('@')[0] || 'User',
              role: 'player',
            };
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.email?.split('@')[0] || 'User',
            role: profile.role,
          };
        } catch (err) {
          console.error('[NextAuth] Error in authorize credentials:', err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as CustomUser).role || 'player';
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as CustomUser).id = token.id as string;
        (session.user as unknown as CustomUser).role = token.role as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-and-tests',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
