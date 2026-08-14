"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
import { z } from "zod";

import { signInSchema } from "@/schemas/signInSchema";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

/* =========================================================
   SIGN IN FORM
========================================================= */

function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    router.refresh();
  }, [router]);

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn("credentials", {
      redirect: false,
      username: data.username,
      password: data.password,
    });

    if (result?.error) {
      toast.error("Invalid credentials");
    } else {
      router.refresh();
      router.push(callbackUrl);
    }
  };

  return (
    <main className="min-h-screen bg-background lg:p-4">

      <div
        className="
          mx-auto flex min-h-screen max-w-7xl overflow-hidden
          bg-card
          lg:min-h-[calc(100vh-2rem)]
          lg:rounded-3xl
          lg:border lg:border-border
          lg:shadow-xl
        "
      >
        <div className="flex justify-end p-4 absolute top-0 right-0 z-50 w-full">
          <ThemeToggle />
        </div>
        {/* =====================================================
            LEFT — BRAND / MARKETING SECTION
        ====================================================== */}

        <section
          className="
            relative hidden w-1/2 overflow-hidden
            bg-brand-gradient
            p-10 text-white
            lg:flex
            xl:p-14
          "
        >
          {/* Decorative glow */}

          <div
            className="
              absolute -right-24 -top-24
              h-72 w-72
              rounded-full
              bg-white/10
              blur-3xl
            "
          />

          <div
            className="
              absolute -bottom-32 -left-24
              h-80 w-80
              rounded-full
              bg-violet-300/10
              blur-3xl
            "
          />

          {/* Subtle background grid */}

          <div
            className="
              absolute inset-0
              opacity-[0.06]
              [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)]
              [background-size:40px_40px]
            "
          />

          <div className="relative z-10 flex w-full flex-col">
            {/* =================================================
                BRAND LOGO
            ================================================== */}

            <div className="flex items-center gap-3">
              {/* App icon */}

              <div
                className="
                  flex h-12 w-12 items-center justify-center
                  rounded-2xl
                  bg-white
                  p-2
                  backdrop-blur-md
                  ring-1 ring-white/20
                "
              >
                <img
                  src="/logo/icon.png"
                  alt="Kakshyasathi"
                  className="h-full w-full object-contain"
                />
              </div>

              {/* Brand name */}

              <div>
                <p className="text-lg font-bold tracking-tight">
                  Kakshyasathi
                </p>

                <p className="text-xs text-indigo-100">
                  Smart Classroom Platform
                </p>
              </div>
            </div>

            {/* =================================================
                MAIN MARKETING CONTENT
            ================================================== */}

            <div className="my-auto max-w-xl py-12">
              {/* Small badge */}

              <div
                className="
                  mb-6 inline-flex items-center gap-2
                  rounded-full
                  border border-white/15
                  bg-white/10
                  px-3.5 py-2
                  text-xs font-medium
                  backdrop-blur-md
                "
              >
                <Sparkles className="h-3.5 w-3.5" />

                <span>
                  Smarter classrooms, Brighter future.
                </span>
              </div>

              {/* Heading */}

              <h1
                className="
                  text-4xl font-bold
                  leading-[1.08]
                  tracking-tight
                  xl:text-5xl
                "
              >
                One classroom.
                <br />

                <span className="text-indigo-200">
                  Everything connected.
                </span>
              </h1>

              {/* Description */}

              <p
                className="
                  mt-6 max-w-lg
                  text-sm leading-7
                  text-indigo-100
                  xl:text-base
                "
              >
                Kakshyasathi brings attendance, schedules, teachers,
                announcements and smart classroom information together
                in one simple platform.
              </p>

              {/* =================================================
                  FEATURES
              ================================================== */}

              <div className="mt-10 space-y-3">
                <Feature
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  title="Smart Attendance"
                  description="Attendance through your existing school ID"
                />

                <Feature
                  icon={<Sparkles className="h-4 w-4" />}
                  title="Live Classroom"
                  description="Schedules and classroom information in real time"
                />

                <Feature
                  icon={<ShieldCheck className="h-4 w-4" />}
                  title="Connected School"
                  description="One platform for students, teachers and administrators"
                />
              </div>

              {/* =================================================
                  SUBTLE BRAND VISUAL
              ================================================== */}

              <div
                className="
                  relative mt-12
                  h-28 overflow-hidden
                  rounded-2xl
                  border border-white/10
                  bg-white/[0.06]
                  backdrop-blur-sm
                "
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-6">
                    {/* Logo */}

                    <div
                      className="
                        flex h-16 w-16
                        items-center justify-center
                        rounded-2xl
                        border border-white/10
                        bg-white
                      "
                    >
                      <img
                        src="/logo/icon.png"
                        alt=""
                        className="h-9 w-9 object-contain"
                      />
                    </div>

                    {/* Connection line */}

                    <div className="h-px w-12 bg-white/20" />

                    {/* Status */}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="
                            h-2 w-2
                            rounded-full
                            bg-emerald-400
                          "
                        />

                        <span className="text-sm font-medium">
                          Classroom connected
                        </span>
                      </div>

                      <p className="text-xs text-indigo-200">
                        Attendance · Schedule · Notices
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                LEFT FOOTER
            ================================================== */}

            <div
              className="
                flex items-center justify-between
                text-xs text-indigo-200
              "
            >
              <span>© 2026 Kakshyasathi</span>

              <span className="flex items-center gap-1.5">
                Built for smarter schools

                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT — LOGIN SECTION
        ====================================================== */}

        <section className="flex w-full flex-col bg-card lg:w-1/2">
          {/* ===================================================
              MOBILE LOGO
          ==================================================== */}

          <div className="flex items-center gap-3 p-6 lg:hidden">
            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                bg-white p-2 
                
              "
            >
              <img
                src="/logo/icon.png"
                alt="Kakshyasathi"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <p className="font-bold text-foreground">
                Kakshyasathi
              </p>

              <p className="text-[11px] text-muted-foreground">
                Smart Classroom Platform
              </p>
            </div>
          </div>

          {/* ===================================================
              LOGIN CONTENT
          ==================================================== */}

          <div
            className="
              flex flex-1
              items-center justify-center
              px-6 py-10
              sm:px-10
              lg:px-14
              xl:px-20
            "
          >
            <div className="w-full max-w-md">
              {/* =================================================
                  SMALL BRAND ICON
              ================================================== */}

              <div
                className="
                  mb-8 hidden
                  h-12 w-12
                  items-center justify-center
                  rounded-2xl
                  bg-white
                  p-2
                  lg:flex
                "
              >
                <img
                  src="/logo/icon.png"
                  alt="Kakshyasathi"
                  className="h-full w-full object-contain"
                />
              </div>

              {/* =================================================
                  HEADING
              ================================================== */}

              <div className="mb-8">
                <p className="mb-2 text-sm font-medium text-primary">
                  Welcome to Kakshyasathi
                </p>

                <h2
                  className="
                    text-3xl font-bold
                    tracking-tight
                    text-foreground
                    sm:text-4xl
                  "
                >
                  Welcome{" "}
                  <span className="text-primary">
                    back.
                  </span>
                </h2>

                <p
                  className="
                    mt-3
                    text-sm leading-6
                    text-muted-foreground
                    sm:text-base
                  "
                >
                  Sign in using the account provided by your
                  school.
                </p>
              </div>

              {/* =================================================
                  LOGIN FORM
              ================================================== */}

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {/* =================================================
                    USERNAME
                ================================================== */}

                <div>
                  <label
                    htmlFor="username"
                    className="label-field"
                  >
                    Username
                  </label>

                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Enter your username"
                    {...register("username")}
                    className="input-field h-12"
                    aria-invalid={!!errors.username}
                  />

                  {errors.username && (
                    <p className="mt-1.5 text-xs text-destructive">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* =================================================
                    PASSWORD
                ================================================== */}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="label-field mb-0"
                    >
                      Password
                    </label>

                    <Link
                      href="/forgot-password"
                      className="
                        text-xs font-medium
                        text-primary
                        transition-colors
                        hover:text-primary/80
                      "
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    {...register("password")}
                    className="input-field h-12"
                    aria-invalid={!!errors.password}
                  />

                  {errors.password && (
                    <p className="mt-1.5 text-xs text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* =================================================
                    SUBMIT BUTTON
                ================================================== */}

                <Button
                  type="submit"
                  size="lg"
                  className="
                    h-12 w-full
                    text-sm font-semibold
                    shadow-sm
                  "
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* =================================================
                  SCHOOL ACCOUNT MESSAGE
              ================================================== */}

              <div
                className="
                  mt-8
                  flex items-center
                  justify-center gap-2
                  text-xs
                  text-muted-foreground
                "
              >
                <ShieldCheck
                  className="
                    h-4 w-4
                    shrink-0
                    text-primary
                  "
                />

                <span>
                  Your account is managed by your school
                </span>
              </div>

              {/* =================================================
                  SECURITY MESSAGE
              ================================================== */}

              <div
                className="
                  mt-4
                  text-center
                  text-xs
                  text-muted-foreground/70
                "
              >
                Secure access to your school account
              </div>
            </div>
          </div>

          {/* ===================================================
              MOBILE FOOTER
          ==================================================== */}

          <div
            className="
              px-6 pb-6
              text-center
              text-xs
              text-muted-foreground
              lg:hidden
            "
          >
            © 2026 Kakshyasathi · Smart Classroom Platform
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   FEATURE COMPONENT
========================================================= */

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        flex items-center gap-4
        rounded-xl
        border border-white/10
        bg-white/[0.06]
        p-3.5
        backdrop-blur-sm
      "
    >
      <div
        className="
          flex h-9 w-9 shrink-0
          items-center justify-center
          rounded-lg
          bg-white/10
        "
      >
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold text-white">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-indigo-200">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function Page() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}