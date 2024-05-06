function FormContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-30 h-[80%] w-[80%] overflow-y-auto overflow-x-hidden bg-gallery-100/80 p-4 shadow-sm lg:p-8 ">
      {children}
    </div>
  );
}

export default FormContainer;
