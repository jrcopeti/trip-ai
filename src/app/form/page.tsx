"use client";
import Loader from "@/components/ui/Loader";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Form from "@/components/form/Form";

const DynamicForm = dynamic(() => import("@/components/form/Form"), {
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
      {/* {isLoading && <Loader />} */}
      <Form />
    </>
  );
}

export default FormPage;
