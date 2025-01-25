import { useLoaderStore } from "@/stores/loader.store";

export const Loader = () => {
  const { isLoading } = useLoaderStore();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="container mt-4">
          <div className="cube">
            <div className="cube__inner"></div>
          </div>
          <div className="cube">
            <div className="cube__inner"></div>
          </div>
          <div className="cube">
            <div className="cube__inner"></div>
          </div>
        </div>
      </div>
    );
  }
  return <></>;
};
