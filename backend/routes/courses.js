// backend/routes/courses.js
import express from "express";

const router = express.Router();

// ✅ Static course data (you can edit/add freely)
const courses = [
  {
    id: 1,
    title: "Web Development",
    description:
      "Learn full-stack web development with HTML, CSS, JavaScript, React, and Node.js.",
    duration: "12 weeks · 60 lessons",
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400",
    link: "https://www.youtube.com/watch?v=nu_pCVPKzTk",
    instructor: "John Doe",
    rating: "4.8",
    students: "15.2k",
  },
  {
    id: 2,
    title: "Python Programming",
    description:
      "Master Python from basics to advanced concepts including data structures, algorithms, and web development.",
    duration: "8 weeks · 40 lessons",
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=400",
    link: "https://www.youtube.com/watch?v=nLRL_NcnK-4",
    instructor: "Jane Smith",
    rating: "4.9",
    students: "12.7k",
  },
  {
    id: 3,
    title: "Java Programming",
    description:
      "Comprehensive Java course for software development, covering OOP, design patterns, and enterprise applications.",
    duration: "10 weeks · 50 lessons",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=400",
    link: "https://www.youtube.com/watch?v=xTtL8E4LzTQ",
    instructor: "Mike Johnson",
    rating: "4.7",
    students: "8.9k",
  },
  {
    id: 4,
    title: "Cloud Computing",
    description:
      "Learn AWS, Azure, and Google Cloud Platform fundamentals and deployment strategies.",
    duration: "14 weeks · 70 lessons",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
    link: "https://www.youtube.com/watch?v=EN4fEbcFZ_E",
    instructor: "Sarah Wilson",
    rating: "4.8",
    students: "6.3k",
  },
  {
    id: 5,
    title: "Artificial Intelligence",
    description:
      "AI and machine learning fundamentals, including neural networks and deep learning.",
    duration: "16 weeks · 80 lessons",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400",
    link: "https://www.youtube.com/watch?v=5NgNicANyqM",
    instructor: "Dr. Alex Chen",
    rating: "4.9",
    students: "11.4k",
  },
  {
    id: 6,
    title: "Power BI",
    description:
      "Learn data visualization and create interactive dashboards using Power BI.",
    duration: "6 weeks · 30 lessons",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
    link: "https://www.youtube.com/watch?v=FwjaHCVNBWA",
    instructor: "Emily Davis",
    rating: "4.6",
    students: "7.8k",
  },
];

// ✅ GET all courses
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    count: courses.length,
    courses,
  });
});

export default router;
