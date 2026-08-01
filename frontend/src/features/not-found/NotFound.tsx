import { ArrowLeft, Home, SearchX } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[65vh] items-center justify-center">
      <div className="max-w-lg text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
          <SearchX className="h-9 w-9" />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-blue-600">
          Error 404
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Page not found
        </h1>

        <p className="mt-3 text-slate-500">
          The page you are trying to open does not exist or may have been moved.
        </p>

        <div className="mt-7 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}