"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Monitor,
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
    console.log("refresh router");
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
      toast.success("Logged in successfully!");
      router.push(callbackUrl);
    }
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-background lg:p-4">
      <div
        className="
          relative mx-auto flex h-screen max-w-7xl overflow-hidden
          bg-card
          lg:h-[calc(100vh-2rem)]
          lg:rounded-3xl
          lg:border lg:border-border
          lg:shadow-2xl
        "
      >
        <div className="absolute right-0 top-0 z-50 flex w-full justify-end p-4">
          <ThemeToggle />
        </div>

        {/* =====================================================
            LEFT — BRAND / MARKETING SECTION
        ====================================================== */}

        <section
          className="
            relative hidden w-1/2 overflow-hidden
            bg-brand-gradient
            p-8 text-primary-foreground
            lg:flex
            xl:p-10
          "
        >
          {/* Decorative glow */}
          <div
            className="
              absolute -right-24 -top-24
              h-72 w-72
              rounded-full
              bg-primary-foreground/10
              blur-3xl
            "
          />

          <div
            className="
              absolute -bottom-32 -left-24
              h-80 w-80
              rounded-full
              bg-primary-foreground/10
              blur-3xl
            "
          />

          {/* Subtle background grid */}
          <div
            className="
              absolute inset-0
              opacity-[0.06]
              [background-image:linear-gradient(var(--primary-foreground)_1px,transparent_1px),linear-gradient(90deg,var(--primary-foreground)_1px,transparent_1px)]
              [background-size:40px_40px]
            "
          />

          <div className="relative z-10 flex h-full w-full flex-col">
            {/* BRAND LOGO */}
            <div className="flex items-center gap-3">
              <div
                className="
                  flex h-11 w-11 items-center justify-center
                  rounded-2xl
                  bg-primary-foreground
                  p-2
                  backdrop-blur-md
                  ring-1 ring-primary-foreground/20
                "
              >
                <img
                  src="/logo/icon.png"
                  alt="Kakshyasathi"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <p className="text-base font-bold tracking-tight">
                  Kakshyasathi
                </p>
                <p className="text-[11px] text-primary-foreground/70">
                  Smart Classroom Platform
                </p>
              </div>
            </div>

            {/* MAIN MARKETING CONTENT */}
            <div className="my-auto max-w-xl">
              <div
                className="
                  mb-5 inline-flex items-center gap-2
                  rounded-full
                  border border-primary-foreground/15
                  bg-primary-foreground/10
                  px-3.5 py-1.5
                  text-xs font-medium
                  backdrop-blur-md
                "
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Smarter classrooms, brighter future.</span>
              </div>

              <h1
                className="
                  text-3xl font-bold
                  leading-[1.1]
                  tracking-tight
                  xl:text-4xl
                "
              >
                One classroom.
                <br />
                <span className="text-primary-foreground/80">
                  Everything connected.
                </span>
              </h1>

              <p
                className="
                  mt-4 max-w-lg
                  text-sm leading-6
                  text-primary-foreground/80
                "
              >
                Kakshyasathi brings attendance, schedules, teachers,
                announcements and smart classroom information together in one
                simple platform.
              </p>

              <div className="mt-6 space-y-2.5">
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

              <div
                className="
                  relative mt-6
                  hidden h-24 overflow-hidden
                  rounded-2xl
                  border border-primary-foreground/10
                  bg-primary-foreground/[0.06]
                  backdrop-blur-sm
                  xl:block
                "
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-5">
                    <div
                      className="
                        flex h-14 w-14
                        items-center justify-center
                        rounded-2xl
                        border border-primary-foreground/10
                        bg-primary-foreground
                      "
                    >
                      <img
                        src="/logo/icon.png"
                        alt=""
                        className="h-8 w-8 object-contain"
                      />
                    </div>

                    <div className="h-px w-10 bg-primary-foreground/20" />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-chart-4" />
                        <span className="text-sm font-medium">
                          Classroom connected
                        </span>
                      </div>
                      <p className="text-xs text-primary-foreground/70">
                        Attendance · Schedule · Notices
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LEFT FOOTER */}
            <div className="flex items-center justify-between text-xs text-primary-foreground/70">
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

        <section className="flex h-full w-full flex-col bg-card lg:w-1/2">
          {/* MOBILE LOGO */}
          <div className="flex items-center gap-3 p-6 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground p-2">
              <img
                src="/logo/icon.png"
                alt="Kakshyasathi"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <p className="font-bold text-foreground">Kakshyasathi</p>
              <p className="text-[11px] text-muted-foreground">
                Smart Classroom Platform
              </p>
            </div>
          </div>

          {/* LOGIN CONTENT */}
          <div
            className="
              flex flex-1 flex-col
              items-center justify-center
              overflow-y-auto
              px-6 py-6
              sm:px-10
              lg:px-14
              xl:px-16
            "
          >
            <div className="w-full max-w-md">
              <div
                className="
                  mb-6 hidden
                  h-11 w-11
                  items-center justify-center
                  rounded-2xl
                  bg-primary-foreground
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

              <div className="mb-6">
                <p className="mb-1.5 text-sm font-medium text-primary">
                  Welcome to Kakshyasathi
                </p>
                <h2
                  className="
                    text-2xl font-bold
                    tracking-tight
                    text-foreground
                    sm:text-3xl
                  "
                >
                  Welcome <span className="text-primary">back.</span>
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Sign in using the account provided by your school.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="username" className="label-field">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Enter your username"
                    {...register("username")}
                    className="input-field h-11"
                    aria-invalid={!!errors.username}
                  />
                  {errors.username && (
                    <p className="mt-1.5 text-xs text-destructive">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="password" className="label-field mb-0">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
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
                    className="input-field h-11"
                    aria-invalid={!!errors.password}
                  />
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full text-sm font-semibold shadow-sm transition-transform active:scale-[0.99]"
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
              {/* Smart Board Setup */}
              <div className="mt-5">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-x-0 h-px bg-border" />
                  <span className="relative bg-card px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Device access
                  </span>
                </div>

                <Link
                  href="/setup"
                  className="
      group mt-4 flex w-full items-center gap-3
      rounded-xl border border-border
      bg-muted/30 p-3.5
      transition-all duration-200
      hover:border-primary/30
      hover:bg-primary/[0.04]
      hover:shadow-sm
    "
                >
                  <div
                    className="
        flex h-9 w-9 shrink-0 items-center justify-center
        rounded-lg
        bg-primary/10
        text-primary
        transition-colors
        group-hover:bg-primary/15
      "
                  >
                    <Monitor className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm font-semibold text-foreground">
                      Set up a Smart Board
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Configure this device for classroom use
                    </p>
                  </div>

                  <ArrowRight
                    className="
        h-4 w-4 shrink-0
        text-muted-foreground
        transition-all duration-200
        group-hover:translate-x-0.5
        group-hover:text-primary
      "
                  />
                </Link>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                <span>Your account is managed by your school</span>
              </div>

              <div className="mt-2 text-center text-xs text-muted-foreground/70">
                Secure access to your school account
              </div>
            </div>
          </div>

          {/* MOBILE FOOTER */}
          <div className="px-6 pb-4 text-center text-xs text-muted-foreground lg:hidden">
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
        border border-primary-foreground/10
        bg-primary-foreground/[0.06]
        p-3
        backdrop-blur-sm
        transition-colors
        hover:bg-primary-foreground/[0.09]
      "
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs text-primary-foreground/70">
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
