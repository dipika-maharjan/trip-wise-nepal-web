import CreateOptionalExtraForm from "../_components/CreateOptionalExtraForm";

export default function CreateOptionalExtraPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <a className="text-[#0c7272] hover:text-[#0a5555]" href="/admin/optional-extras">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left" aria-hidden="true"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
                </a>
                <h1 className="text-2xl font-bold text-gray-800">Create Optional Extra</h1>
            </div>
            <p className="text-gray-600 mt-2">Add a new optional extra to an accommodation</p>
            <div className="bg-white rounded-lg shadow p-6">
                <CreateOptionalExtraForm />
            </div>
        </div>
    );
}
