import { useState } from 'react';
import { courseAPI } from '../api';

function MaterialUpload({ courseId, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'document',
        duration: ''
    });
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Auto-set title from filename if title is empty
            if (!formData.title) {
                setFormData(prev => ({
                    ...prev,
                    title: selectedFile.name.split('.').slice(0, -1).join('.')
                }));
            }

            // Auto-detect type
            if (selectedFile.type.startsWith('video/')) {
                setFormData(prev => ({ ...prev, type: 'video' }));
            } else {
                setFormData(prev => ({ ...prev, type: 'document' }));
            }

            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('title', formData.title);
            uploadData.append('description', formData.description);
            uploadData.append('type', formData.type);
            if (formData.duration) {
                uploadData.append('duration', formData.duration);
            }

            await courseAPI.uploadMaterial(courseId, uploadData);

            // Reset form
            setFile(null);
            setFormData({
                title: '',
                description: '',
                type: 'document',
                duration: ''
            });
            // Reset file input manually
            document.getElementById('file-upload').value = '';

            if (onUploadSuccess) onUploadSuccess();
            alert('Material uploaded successfully!');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to upload material');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Upload New Material</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                    <input
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        accept=".pdf,.doc,.docx,.mp4,.avi,.mov,.mkv"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                            placeholder="Material title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                        >
                            <option value="document">Document</option>
                            <option value="video">Video</option>
                            <option value="audio">Audio</option>
                        </select>
                    </div>
                </div>

                {formData.type === 'video' || formData.type === 'audio' ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                        <input
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                            placeholder="Example: 15"
                        />
                    </div>
                ) : null}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                        placeholder="Short description..."
                    ></textarea>
                </div>

                {error && (
                    <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition disabled:opacity-50"
                >
                    {uploading ? 'Uploading...' : 'Upload Material'}
                </button>
            </form>
        </div>
    );
}

export default MaterialUpload;
