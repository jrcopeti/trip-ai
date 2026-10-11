import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import SavedTripsDisplay from "@/components/saved-trips/SavedTripsDisplay";
import SiteFooter from "@/components/ui/SiteFooter";

function SavedTripsPage() {
  const queryClient = new QueryClient();

  return (
    <div className="min-h-dvh bg-sorbet-canvas font-sorbet text-sorbet-ink antialiased">
      <main>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <SavedTripsDisplay />
        </HydrationBoundary>
      </main>
      <SiteFooter />
    </div>
  );
}

export default SavedTripsPage;
