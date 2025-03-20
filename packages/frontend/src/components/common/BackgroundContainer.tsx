interface BackgroundContainerProps {
  children: React.ReactNode;
}

const BackgroundContainer = ({ children }: BackgroundContainerProps) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 bg-memcrypt bg-cover bg-center">
      {children}
    </div>
  );
};

export default BackgroundContainer;
