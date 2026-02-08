
export default function Dashboard() {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700">
                    <h3 className="text-gray-500 text-sm font-medium">Total Employees</h3>
                    <p className="text-3xl font-bold mt-2">124</p>
                    <span className="text-green-500 text-sm mt-2 block">+12 this month</span>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700">
                    <h3 className="text-gray-500 text-sm font-medium">Active Templates</h3>
                    <p className="text-3xl font-bold mt-2">3</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700">
                    <h3 className="text-gray-500 text-sm font-medium">Cards Generated</h3>
                    <p className="text-3xl font-bold mt-2">86</p>
                    <span className="text-indigo-500 text-sm mt-2 block">Pending: 5</span>
                </div>
            </div>

            <div className="mt-8 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Recent ID Cards</h3>
                    <button className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline">View All</button>
                </div>
                <div className="p-6">
                    <p className="text-gray-500 text-center py-8">No recent activity found.</p>
                </div>
            </div>
        </>
    );
}
