const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/Course.model'); // Adjust path as needed

// Load env vars
dotenv.config(); // Defaults to .env in cwd

const updateThumbnails = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const updates = [
            { title: 'Advanced React Development', thumbnail: '/courses/react-advanced.png' },
            { title: 'Business Strategy 101', thumbnail: '/courses/business-strategy.png' },
            { title: 'Data Science with Python', thumbnail: '/courses/data-science.png' },
            { title: 'Web Design Fundamentals', thumbnail: '/courses/web-design.png' },
            { title: 'Introduction to JavaScript', thumbnail: '/courses/intro-js.png' }
        ];

        for (const update of updates) {
            const result = await Course.findOneAndUpdate(
                { title: update.title },
                { thumbnail: update.thumbnail },
                { new: true }
            );

            if (result) {
                console.log(`Updated: ${update.title} -> ${update.thumbnail}`);
            } else {
                console.log(`Course not found: ${update.title}`);
            }
        }

        console.log('Update complete');
        process.exit(0);
    } catch (error) {
        console.error('Error updating thumbnails:', error);
        process.exit(1);
    }
};

updateThumbnails();
