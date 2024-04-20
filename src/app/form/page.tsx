"use client";
import Form from "@/components/Form";
import Container from "@/components/ui/Container";
import FormContainer from "@/components/ui/FormContainer";
import GradientBg from "@/components/ui/GradientBg";
import Loader from "@/components/ui/Loader";
import { Suspense, useEffect, useState } from "react";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
  useQueryClient,
} from "@tanstack/react-query";
import dynamic from "next/dynamic";

const DynamicForm = dynamic(() => import("@/components/Form"), {
  ssr: false,
});

function FormPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {isLoading && <Loader />}
      <Container overflow="overflow-hidden">
        <GradientBg
          from="from-violay-300"
          to="to-deeporange-200"
          blur="blur-[190px]"
        />

        <DynamicForm />
      </Container>
    </>
  );
}

export default FormPage;
