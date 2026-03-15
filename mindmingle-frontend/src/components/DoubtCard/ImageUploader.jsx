import { X, ImagePlus } from 'lucide-react'

export default function ImageUploader({ images, onImagesChange }) {
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files)
        const newImages = [...images]

        files.forEach(file => {
            if (file.type.startsWith('image/') && newImages.length < 5) {
                newImages.push(file)
            }
        })

        onImagesChange(newImages)
    }

    const removeImage = (index) => {
        onImagesChange(images.filter((_, i) => i !== index))
    }

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
                Screenshots (optional, max 5)
            </label>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-primary-400 hover:bg-primary-50 transition-all cursor-pointer group"
                onClick={() => document.getElementById('image-upload').click()}>
                <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                />
                <ImagePlus className="w-12 h-12 text-gray-400 mx-auto mb-4 group-hover:text-primary-500 transition-colors" />
                <p className="text-lg font-medium text-gray-900 group-hover:text-primary-600">
                    {images.length === 0 ? 'Click to upload images' : `+${5 - images.length} more`}
                </p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 5MB</p>
            </div>

            {/* Preview */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
                    {images.map((image, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={URL.createObjectURL(image)}
                                alt="Preview"
                                className="w-full h-24 object-cover rounded-xl shadow-md"
                            />
                            <button
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
                {images.length}/5 images
            </p>
        </div>
    )
}
