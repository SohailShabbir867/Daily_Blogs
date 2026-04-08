import BlogCard from "../components/BlogCard";
import NewsletterSubscription from "../components/NewsletterSubscription";
import SEO from "../components/SEO";
import { useBlog } from "../context/BlogContext";
import { useState, useEffect, useCallback } from "react";

const BLOGS_PER_PAGE = 18;

const Home = () => {
  const { blogs, trendingBlogs, trendingLoading, loading, error, pagination, fetchBlogs } = useBlog();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showTrending, setShowTrending] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Typewriter effect state
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const typewriterPhrases = [
      "New Technologies",
      "Movie Reviews",
      "Study Materials",
      "Game Guides",
      "Government Schemes",
      "Job & Resume Tips",
      "Visa & Immigration",
      "Linux Tools",
      "Coding Tutorials",
      "Cybersecurity",
      "Earning Opportunities",
      "Mobile Apps & Gadgets",
      "University Admissions",
      "Data Science",
      "Foreign Study Abroad",
      "Career Advice",
    ];

    const currentPhrase = typewriterPhrases[currentPhraseIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseTime = 2000;

    let pauseTimeout;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < currentPhrase.length) {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1));
        } else {
          // Pause before deleting
          pauseTimeout = setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentPhraseIndex(
            (prev) => (prev + 1) % typewriterPhrases.length,
          );
        }
      }
    }, typingSpeed);

    return () => {
      clearTimeout(timeout);
      clearTimeout(pauseTimeout);
    };
  }, [currentText, isDeleting, currentPhraseIndex]);

  // Fetch blogs with pagination whenever page, search, or category changes
  useEffect(() => {
    const params = { page: currentPage, limit: BLOGS_PER_PAGE };
    if (searchTerm) params.search = searchTerm;
    if (selectedCategory !== "All") params.category = selectedCategory;
    fetchBlogs(params);
  }, [currentPage, selectedCategory]);

  // Debounced search: reset to page 1 when user searches
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      const params = { page: 1, limit: BLOGS_PER_PAGE };
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== "All") params.category = selectedCategory;
      fetchBlogs(params);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const faqs = [
    {
      question: "What is Daily Blogs?",
      answer:
        "Daily Blogs is an all-in-one knowledge platform covering a wide range of topics including technologies, coding tutorials, study materials, movie & game reviews, government schemes, job guides & resume tips, visa & immigration help, Linux tools, cybersecurity, and much more.",
    },
    {
      question: "What topics does Daily Blogs cover?",
      answer:
        "We cover technologies, programming & coding, study materials, movie reviews, game guides, government schemes, jobs & resume writing, visa & foreign travel, Linux tools, cybersecurity, data science, mobile apps, earning opportunities, university admissions, and more.",
    },
    {
      question: "How often is new content published?",
      answer:
        "We publish new articles regularly, typically several times a week across all our categories. Subscribe to our newsletter to get notified when new content is available.",
    },
    {
      question: "Can I contribute to Daily Blogs?",
      answer:
        "Yes! We welcome guest contributors across all topics. Whether you're into tech, movies, gaming, career advice, or travel — contact us through our Contact page to discuss collaboration.",
    },
    {
      question: "Is the content free to read?",
      answer:
        "Most of our content is free and accessible to everyone. Some premium articles may require registration to access the full content.",
    },
    {
      question: "How can I save articles for later?",
      answer:
        "Once you create an account and log in, you can save any article by clicking the bookmark icon. Access your saved articles anytime from your profile.",
    },
    {
      question: "How do I subscribe to the newsletter?",
      answer:
        "Simply scroll down to the newsletter section on this page, enter your email address, and click subscribe. You'll receive updates about new articles and exclusive content.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const categories = [
    "All",
    ...new Set(blogs.map((blog) => blog.category).filter(Boolean)),
  ];

  // Show all blogs from the backend in the main grid (backend handles pagination)
  // No client-side filtering needed since search/category are sent as API params
  const filteredBlogs = blogs;

  // Only show trending section on page 1 with no search active
  const showTrendingSection = currentPage === 1 && !showTrending && !searchTerm && trendingBlogs.length > 0;

  // The Hero section should eagerly render. The loading state is handled down in the blog grid.

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Failed to Load Articles
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-linear-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Daily Blogs - Tech, Study Materials, Movies, Games, Jobs, Visa & More"
        description="Your all-in-one knowledge hub. Explore expert articles on technologies, coding tutorials, study materials, movie reviews, game guides, government schemes, job tips & resume writing, visa & immigration help, Linux tools, cybersecurity, and much more. Updated daily."
        keywords="daily blogs, blog website, technologies, coding tutorials, study material, movie reviews, game guides, government schemes, job tips, resume writing, visa guide, immigration help, foreign study, Linux tools, cybersecurity, web development, programming, javascript, react, earning opportunities, mobile apps, data science, university admissions, gadgets, career advice, tech news, how to guides, educational articles, how to earn money online, best programming languages, latest tech news, coding tutorials for beginners, learn web development free"
        type="website"
        faqItems={faqs}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-emerald-900 via-teal-800 to-cyan-900 text-white py-16 sm:py-24 md:py-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Gradient Orbs */}
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div
            className="absolute top-40 -right-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute -bottom-20 left-1/3 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
            style={{ animationDelay: "2s" }}
          />

          {/* Decorative Shapes */}
          <div className="absolute top-20 left-[5%] w-20 h-20 border border-white/10 rounded-full" />
          <div className="absolute top-40 right-[10%] w-32 h-32 border border-white/10 rounded-full" />
          <div className="absolute bottom-20 left-[15%] w-16 h-16 border border-white/10 rotate-45" />

          {/* Floating Dots */}
          <div
            className="absolute top-24 left-[15%] w-2 h-2 bg-emerald-300 rounded-full animate-bounce"
            style={{ animationDuration: "3s" }}
          />
          <div
            className="absolute top-48 left-[30%] w-1.5 h-1.5 bg-cyan-300 rounded-full animate-bounce"
            style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}
          />
          <div
            className="absolute top-36 right-[20%] w-2 h-2 bg-teal-300 rounded-full animate-bounce"
            style={{ animationDuration: "3.5s", animationDelay: "1s" }}
          />
          <div
            className="absolute bottom-40 left-[20%] w-1 h-1 bg-lime-300 rounded-full animate-bounce"
            style={{ animationDuration: "2.8s", animationDelay: "1.5s" }}
          />
          <div
            className="absolute bottom-28 right-[30%] w-1.5 h-1.5 bg-emerald-200 rounded-full animate-bounce"
            style={{ animationDuration: "3.2s", animationDelay: "0.8s" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5 mb-8 hover:bg-white/15 transition-colors">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime-400"></span>
              </span>
              <span className="text-sm font-medium text-emerald-100">
                ✨ Fresh articles every week
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
              <span className="block text-white drop-shadow-lg">
                Explore. Learn.
              </span>
              <span className="bg-linear-to-r from-lime-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                Grow Daily.
              </span>
            </h1>

            {/* Typewriter Effect */}
            <div className="min-h-[2.5rem] sm:h-12 md:h-14 mb-6 flex items-center justify-center">
              <span className="text-base sm:text-xl md:text-2xl lg:text-3xl font-semibold text-emerald-100 text-center">
                Discover insights on{" "}
                <span className="text-lime-300 font-bold">
                  {currentText}
                  <span className="animate-pulse">|</span>
                </span>
              </span>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl text-emerald-100/90 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
              Your daily source for insightful articles on tech, study
              materials, movies, games, jobs, visa guides, and much more.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative mb-8 sm:mb-12 px-0">
              <div className="relative flex items-center bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
                <div className="absolute left-4 sm:left-5 text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search articles, topics or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-14 pr-20 sm:pr-32 py-4 sm:py-5 text-sm sm:text-base text-gray-900 placeholder-gray-500 focus:outline-none"
                />
                <button 
                  aria-label="Search"
                  className="absolute right-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-medium text-sm sm:text-base hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
                >
                  <span className="hidden sm:inline">Search</span>
                  <svg
                    className="w-4 h-4 sm:hidden"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 sm:px-8 py-3 sm:py-5 hover:bg-white/15 transition-colors">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-lime-300">
                  500+
                </div>
                <div className="text-emerald-200 text-sm mt-1">Articles</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 sm:px-8 py-3 sm:py-5 hover:bg-white/15 transition-colors">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-300">
                  10K+
                </div>
                <div className="text-emerald-200 text-sm mt-1">Readers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 sm:px-8 py-3 sm:py-5 hover:bg-white/15 transition-colors">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal-300">
                  50+
                </div>
                <div className="text-emerald-200 text-sm mt-1">Authors</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 sm:px-8 py-3 sm:py-5 hover:bg-white/15 transition-colors">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-300">
                  100K+
                </div>
                <div className="text-emerald-200 text-sm mt-1">Views</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 60L48 54C96 48 192 36 288 42C384 48 480 72 576 78C672 84 768 72 864 60C960 48 1056 36 1152 36C1248 36 1344 48 1392 54L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      {/* Trending Blogs Section */}
      {showTrendingSection && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Trending Now
                </h2>
                <p className="text-sm text-gray-500">
                  Most popular articles picked by our editors
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowTrending(true);
                setSelectedCategory("All");
              }}
              className="text-sm font-medium text-orange-600 hover:text-orange-700 transition flex items-center gap-1"
            >
              View All
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {trendingLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 animate-pulse border border-gray-100"
                >
                  <div className="h-40 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {trendingBlogs.slice(0, 3).map((blog) => (
                <div key={blog._id || blog.id} className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <span className="inline-flex items-center gap-1 bg-linear-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                      </svg>
                      Trending
                    </span>
                  </div>
                  <BlogCard blog={blog} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Category Filters — horizontal scroll on mobile, wrap on sm+ */}
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 mb-8 pb-2 sm:flex-wrap -mx-4 px-4 sm:mx-0 sm:px-0">
          {/* Trending Filter */}
          <button
            onClick={() => {
              setShowTrending(!showTrending);
              if (!showTrending) setSelectedCategory("All");
            }}
            className={`shrink-0 whitespace-nowrap px-3 sm:px-4 py-2 rounded-full font-medium text-xs sm:text-sm transition flex items-center gap-1.5 ${
              showTrending
                ? "bg-linear-to-r from-orange-500 to-red-500 text-white shadow-md"
                : "bg-white text-orange-600 hover:bg-orange-50 border border-orange-200"
            }`}
          >
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
              fill={showTrending ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
              />
            </svg>
            Trending
            {trendingBlogs.length > 0 && (
              <span
                className={`text-xs rounded-full px-1.5 py-0.5 ${
                  showTrending ? "bg-white/20" : "bg-orange-100 text-orange-700"
                }`}
              >
                {trendingBlogs.length}
              </span>
            )}
          </button>

          <div className="w-px h-8 bg-gray-200 self-center mx-1 shrink-0" />

          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setShowTrending(false);
                setCurrentPage(1);
              }}
              className={`shrink-0 whitespace-nowrap px-3 sm:px-4 py-2 rounded-full font-medium text-xs sm:text-sm transition ${
                !showTrending && selectedCategory === category
                  ? "bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 border"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {showTrending ? (
              <>
                <span className="font-medium text-orange-600">
                  {trendingBlogs.length} trending
                </span>{" "}
                article{trendingBlogs.length !== 1 ? "s" : ""}
              </>
            ) : (
              <>
                {filteredBlogs.length} article
                {filteredBlogs.length !== 1 ? "s" : ""} found
              </>
            )}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse shadow-sm border border-gray-100">
                <div className="h-40 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : showTrending ? (
          trendingBlogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {trendingBlogs.map((blog) => (
                <div key={blog._id || blog.id} className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <span className="inline-flex items-center gap-1 bg-linear-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                      </svg>
                      Trending
                    </span>
                  </div>
                  <BlogCard blog={blog} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg
                className="w-16 h-16 text-orange-200 mx-auto mb-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                No trending articles yet
              </h2>
              <p className="text-gray-600">
                Check back later for trending content.
              </p>
            </div>
          )
        ) : filteredBlogs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredBlogs.map((blog) => (
                <BlogCard key={blog._id || blog.id} blog={blog} />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {/* Previous Button */}
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 400, behavior: "smooth" });
                  }}
                  disabled={currentPage <= 1}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    currentPage <= 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const totalPages = pagination.totalPages;
                    const pages = [];

                    // Always show first page
                    pages.push(1);

                    // Show dots if gap
                    if (currentPage > 3) pages.push("...");

                    // Pages around current
                    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                      pages.push(i);
                    }

                    // Show dots if gap
                    if (currentPage < totalPages - 2) pages.push("...");

                    // Always show last page if > 1
                    if (totalPages > 1) pages.push(totalPages);

                    return pages.map((p, idx) =>
                      p === "..." ? (
                        <span key={`dots-${idx}`} className="px-2 py-1 text-gray-400 text-sm select-none">
                          •••
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => {
                            setCurrentPage(p);
                            window.scrollTo({ top: 400, behavior: "smooth" });
                          }}
                          className={`min-w-[40px] h-10 rounded-xl font-semibold text-sm transition-all ${
                            currentPage === p
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                              : "bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200 shadow-sm hover:shadow-md"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    );
                  })()}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(pagination.totalPages, p + 1));
                    window.scrollTo({ top: 400, behavior: "smooth" });
                  }}
                  disabled={currentPage >= pagination.totalPages}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    currentPage >= pagination.totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Page Info */}
            {pagination && pagination.totalPages > 1 && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Page {currentPage} of {pagination.totalPages} — Showing{" "}
                {Math.min(BLOGS_PER_PAGE, filteredBlogs.length)} of {pagination.totalItems} articles
              </p>
            )}
          </>
        ) : (
          <div className="text-center px-4 sm:px-6">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No articles found
            </h2>
            <p className="text-gray-600">
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
          </div>
        )}
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about Daily Blogs
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-2xl overflow-hidden transition-all duration-200 hover:border-emerald-200 hover:shadow-md"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-answer-${index}`}
                  className="w-full px-6 py-5 flex items-center justify-between text-left bg-white hover:bg-emerald-50/50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-t-2xl"
                >
                  <h3 className="font-semibold text-gray-900 pr-4 m-0 p-0 text-base">
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-5 h-5 text-emerald-600 shrink-0 transition-transform duration-300 ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  id={`faq-answer-${index}`}
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === index ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="px-6 pb-5 text-gray-700 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/25"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription Section */}
      <NewsletterSubscription />
    </div>
  );
};

export default Home;
