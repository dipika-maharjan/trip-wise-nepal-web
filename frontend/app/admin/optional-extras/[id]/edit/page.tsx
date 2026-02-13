import EditOptionalExtraForm from "../../_components/EditOptionalExtraForm";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditOptionalExtraPage({ params }: PageProps) {
    const resolvedParams = await params;
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Edit Optional Extra</h1>
                <p className="text-gray-600 mt-2">Update optional extra details</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
                <EditOptionalExtraForm extraId={resolvedParams.id} />
            </div>
        </div>
    );
}
