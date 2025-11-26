"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../../lib/hooks";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Alert from "../../../components/ui/Alert";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { LoginFormWrapper } from "../../../components/ui/LoginForm";

export default function LoginPage() {
  return <LoginFormWrapper />;
}