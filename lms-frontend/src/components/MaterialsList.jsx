import { useState } from 'react';
import { courseAPI } from '../api';

function MaterialsList({ courseId, materials, isInstructor, onRefresh, completedMaterials = [] }) {
    const [playingVideo, setPlayingVideo] = useState(null);

    const handleDelete = async (materialId) => {
        if (!window.confirm('Are you sure you want to delete this material?')) return;

        try {
            await courseAPI.removeMaterial(courseId, materialId);
            onRefresh();
        } catch (error) {
            console.error('Failed to delete material', error);
            alert('Failed to delete material');
        }
    };

    const handleVideoEnded = async (materialId) => {
        try {
            if (!completedMaterials.includes(materialId)) {
                await courseAPI.markMaterialCompleted(courseId, materialId);
                onRefresh(); // Refresh parent to update progress bar and completed list
            }
        } catch (error) {
            console.error('Failed to mark material as completed', error);
        }
    };

    const getFileIcon = (type) => {
        switch (type) {
            case 'video': return '🎥';
            case 'text': return '📄';
            case 'audio': return '🎵';
            case 'document': return '📎';
            default: return '❓';
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Course Materials</h3>

            {materials.length === 0 ? (
                <p className="text-gray-500 italic">No materials uploaded yet.</p>
            ) : (
                materials.map((material) => {
                    const isCompleted = completedMaterials.includes(material._id);

                    return (
                        <div key={material._id} className={`bg-white border text-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition ${isCompleted ? 'border-l-4 border-l-green-500' : ''}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl" role="img" aria-label={material.type}>
                                        {isCompleted ? '✅' : getFileIcon(material.type)}
                                    </span>
                                    <div>
                                        <h4 className={`font-semibold text-lg ${isCompleted ? 'text-green-700' : ''}`}>{material.title}</h4>
                                        <p className="text-sm text-gray-500 capitalize">
                                            {material.type} • {material.duration > 0 ? `${material.duration} min` : material.fileSize || 'View content'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {material.fileUrl ? (
                                        <>
                                            {/* View/Download/Play Buttons */}
                                            {(material.type === 'video' || material.type === 'audio') ? (
                                                <button
                                                    onClick={() => setPlayingVideo(playingVideo === material._id ? null : material._id)}
                                                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm font-medium transition"
                                                >
                                                    {playingVideo === material._id ? 'Close' : 'Play'}
                                                </button>
                                            ) : (
                                                <a
                                                    href={courseAPI.getMaterialFileUrl(courseId, material._id)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={() => !isInstructor && handleVideoEnded(material._id)} // Auto-mark non-video files as read on click
                                                    className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-sm font-medium transition"
                                                >
                                                    Download
                                                </a>
                                            )}
                                        </>
                                    ) : (
                                        // Legacy materials (text content)
                                        <button
                                            onClick={() => !isInstructor && handleVideoEnded(material._id)}
                                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-medium transition"
                                        >
                                            View
                                        </button>
                                    )}

                                    {isInstructor && (
                                        <button
                                            onClick={() => handleDelete(material._id)}
                                            className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm font-medium transition"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Video Player Section */}
                            {playingVideo === material._id && material.fileUrl && (
                                <div className="mt-4 bg-black rounded overflow-hidden">
                                    <video
                                        controls
                                        preload="metadata"
                                        className="w-full h-auto max-h-[500px]"
                                        src={courseAPI.getMaterialFileUrl(courseId, material._id)}
                                        onEnded={() => !isInstructor && handleVideoEnded(material._id)}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            )}

                            {/* Description/Content for non-file materials */}
                            {!material.fileUrl && (
                                <div className="mt-2 text-sm text-gray-600 border-t pt-2">
                                    {material.content}
                                </div>
                            )}

                            {/* Description for file materials */}
                            {material.fileUrl && material.content && material.content !== 'File content' && (
                                <div className="mt-2 text-sm text-gray-600">
                                    {material.content}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default MaterialsList;
