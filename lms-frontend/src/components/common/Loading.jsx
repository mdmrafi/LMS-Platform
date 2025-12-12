const Loading = ({ fullPage = false, message = 'Loading...' }) => {
    if (fullPage) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">{message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-8">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">{message}</p>
            </div>
        </div>
    );
};

export default Loading;
