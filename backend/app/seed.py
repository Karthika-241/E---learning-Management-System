"""Populates the database with demo data so the app is usable immediately -
no signup flow needed to get realistic-looking content."""
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

from . import models

SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
SAMPLE_VIDEO_2 = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"


def seed(db: Session):
    if db.query(models.User).first():
        return  # already seeded

    # ---------- Users (no auth - just picking a persona) ----------
    instructors = [
        models.User(name="Ananya Rao", role="instructor", avatar_emoji="👩‍💻",
                    headline="Senior ML Engineer, ex-Google"),
        models.User(name="Karthik Subramaniam", role="instructor", avatar_emoji="🧑‍🏫",
                    headline="Full-Stack Developer & Bootcamp Mentor"),
        models.User(name="Priya Menon", role="instructor", avatar_emoji="👩‍🎨",
                    headline="UI/UX Designer, 10+ years"),
        models.User(name="Rahul Verma", role="instructor", avatar_emoji="🧑‍🔬",
                    headline="Data Scientist & Kaggle Grandmaster"),
    ]
    students = [
        models.User(name="Guest Student", role="student", avatar_emoji="🎓",
                    headline="Learning something new every day"),
        models.User(name="Divya Nair", role="student", avatar_emoji="🙋‍♀️", headline=""),
        models.User(name="Arjun Iyer", role="student", avatar_emoji="🙋‍♂️", headline=""),
    ]
    db.add_all(instructors + students)
    db.flush()

    # ---------- Categories ----------
    cat_defs = [
        ("Development", "development", "💻"),
        ("Data Science & AI", "data-science-ai", "🤖"),
        ("Design", "design", "🎨"),
        ("Business", "business", "📈"),
        ("Personal Development", "personal-development", "🧠"),
    ]
    categories = [models.Category(name=n, slug=s, icon=i) for n, s, i in cat_defs]
    db.add_all(categories)
    db.flush()
    cat = {c.slug: c for c in categories}

    # ---------- Courses ----------
    course_defs = [
        dict(title="Complete Python Bootcamp: Zero to Hero",
             subtitle="Master Python with hands-on projects, from basics to OOP and file handling.",
             description="A project-driven course covering Python fundamentals, data structures, "
                          "functions, OOP, file I/O, and small automation projects. Built for "
                          "beginners who want to code confidently by the end.",
             level="Beginner", price=449.0, thumbnail_seed="python-course",
             category=cat["development"], instructor=instructors[1],
             sections=[
                 ("Getting Started", [
                     ("Course Overview & Setup", 4, True),
                     ("Installing Python & VS Code", 8, True),
                 ]),
                 ("Python Fundamentals", [
                     ("Variables & Data Types", 12, False),
                     ("Control Flow: if/else & loops", 15, False),
                     ("Functions & Scope", 14, False),
                 ]),
                 ("Object-Oriented Python", [
                     ("Classes & Objects", 18, False),
                     ("Inheritance & Polymorphism", 16, False),
                 ]),
             ]),
        dict(title="Machine Learning A-Z: Hands-On Python",
             subtitle="Regression, classification, clustering and neural nets with real datasets.",
             description="Go from ML basics to building and evaluating models with scikit-learn "
                          "and an intro to neural networks. Includes case studies on real datasets "
                          "and a capstone project you can put on your resume.",
             level="Intermediate", price=799.0, thumbnail_seed="ml-course",
             category=cat["data-science-ai"], instructor=instructors[0],
             sections=[
                 ("Foundations", [
                     ("What is Machine Learning?", 10, True),
                     ("Setting up your ML environment", 9, True),
                 ]),
                 ("Supervised Learning", [
                     ("Linear & Logistic Regression", 20, False),
                     ("Decision Trees & Random Forests", 22, False),
                     ("Model Evaluation Metrics", 15, False),
                 ]),
                 ("Unsupervised Learning & Beyond", [
                     ("K-Means Clustering", 17, False),
                     ("Intro to Neural Networks", 25, False),
                 ]),
             ]),
        dict(title="UI/UX Design Fundamentals with Figma",
             subtitle="Design clean, usable interfaces and build a portfolio-ready case study.",
             description="Learn user research basics, wireframing, visual design principles, and "
                          "prototyping in Figma. Ends with a full case study you can showcase to "
                          "recruiters.",
             level="Beginner", price=599.0, thumbnail_seed="uiux-course",
             category=cat["design"], instructor=instructors[2],
             sections=[
                 ("Design Thinking", [
                     ("Intro to UX Research", 11, True),
                 ]),
                 ("Visual Design", [
                     ("Color Theory & Typography", 13, False),
                     ("Layout & Grid Systems", 12, False),
                 ]),
                 ("Prototyping in Figma", [
                     ("Wireframes to High-Fidelity", 19, False),
                     ("Building an Interactive Prototype", 21, False),
                 ]),
             ]),
        dict(title="React & FastAPI: Full-Stack Web Development",
             subtitle="Build and ship a full-stack app with React, FastAPI, and SQL.",
             description="A practical, project-based course: build a full-stack CRUD app with a "
                          "React front end, a FastAPI backend, and a relational database, then "
                          "learn how to structure a real project for your portfolio.",
             level="Intermediate", price=899.0, thumbnail_seed="fullstack-course",
             category=cat["development"], instructor=instructors[1],
             sections=[
                 ("Backend with FastAPI", [
                     ("REST API Basics", 14, True),
                     ("Databases with SQLAlchemy", 18, True),
                 ]),
                 ("Frontend with React", [
                     ("Components & Props", 16, False),
                     ("State Management & Hooks", 20, False),
                     ("Connecting to your API", 17, False),
                 ]),
                 ("Shipping It", [
                     ("Deploying your Full-Stack App", 13, False),
                 ]),
             ]),
        dict(title="Data Science & AI Career Roadmap 2026",
             subtitle="Plan your path into AI: skills, projects, and interview prep.",
             description="A career-focused course mapping out exactly what to learn and build to "
                          "land an AI/ML role - includes a resume-ready project checklist and "
                          "mock interview questions.",
             level="Beginner", price=0.0, thumbnail_seed="career-course",
             category=cat["data-science-ai"], instructor=instructors[3],
             sections=[
                 ("Mapping the Field", [
                     ("AI/ML Job Roles Explained", 9, True),
                 ]),
                 ("Building Your Profile", [
                     ("Portfolio Projects that Get Noticed", 15, False),
                     ("Writing an AI/ML Resume", 11, False),
                 ]),
                 ("Interview Prep", [
                     ("Common ML Interview Questions", 20, False),
                 ]),
             ]),
        dict(title="Public Speaking & Communication Mastery",
             subtitle="Speak with confidence in interviews, meetings, and presentations.",
             description="Practical techniques for structuring talks, managing nerves, and "
                          "engaging an audience - useful for placement interviews, seminars, "
                          "and everyday communication.",
             level="Beginner", price=349.0, thumbnail_seed="speaking-course",
             category=cat["personal-development"], instructor=instructors[2],
             sections=[
                 ("Foundations of Confidence", [
                     ("Overcoming Stage Fear", 10, True),
                 ]),
                 ("Structuring Your Message", [
                     ("The 3-Part Talk Structure", 12, False),
                     ("Storytelling for Impact", 14, False),
                 ]),
             ]),
        dict(title="Startup Finance & Business Fundamentals",
             subtitle="Understand budgeting, pricing, and pitching for a new business.",
             description="A grounded introduction to the numbers side of running a business: "
                          "unit economics, budgeting, pricing strategy, and how to pitch to "
                          "investors.",
             level="Intermediate", price=549.0, thumbnail_seed="business-course",
             category=cat["business"], instructor=instructors[3],
             sections=[
                 ("The Numbers", [
                     ("Unit Economics 101", 16, True),
                 ]),
                 ("Growing the Business", [
                     ("Pricing Strategy", 13, False),
                     ("Pitching to Investors", 18, False),
                 ]),
             ]),
        dict(title="Advanced React Patterns & Performance",
             subtitle="Level up with hooks patterns, memoization, and code-splitting.",
             description="For developers who already know React basics and want to write faster, "
                          "more maintainable apps using advanced hooks, context patterns, and "
                          "performance profiling.",
             level="Advanced", price=999.0, thumbnail_seed="advanced-react-course",
             category=cat["development"], instructor=instructors[1],
             sections=[
                 ("Advanced Hooks", [
                     ("Custom Hooks Deep Dive", 17, True),
                 ]),
                 ("Performance", [
                     ("Memoization & useMemo/useCallback", 15, False),
                     ("Code Splitting & Lazy Loading", 14, False),
                 ]),
             ]),
    ]

    for i, cdef in enumerate(course_defs):
        course = models.Course(
            title=cdef["title"], subtitle=cdef["subtitle"], description=cdef["description"],
            level=cdef["level"], price=cdef["price"], thumbnail_seed=cdef["thumbnail_seed"],
            language="English", category=cdef["category"], instructor=cdef["instructor"],
            created_at=datetime.utcnow() - timedelta(days=random.randint(5, 400)),
        )
        for s_idx, (sec_title, lectures) in enumerate(cdef["sections"]):
            section = models.Section(title=sec_title, order=s_idx)
            for l_idx, (lec_title, dur, is_preview) in enumerate(lectures):
                section.lectures.append(models.Lecture(
                    title=lec_title, duration_minutes=dur, order=l_idx,
                    is_preview=is_preview,
                    video_url=SAMPLE_VIDEO if (s_idx + l_idx) % 2 == 0 else SAMPLE_VIDEO_2,
                ))
            course.sections.append(section)
        db.add(course)

    db.flush()
    all_courses = db.query(models.Course).all()

    # ---------- 20 questions per course ----------
    question_pool = {
        "development": [
            ("What does HTML stand for?", "Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Management Language", "Hyper Transfer Markup Language", "a"),
            ("Which language is primarily used for web styling?", "JavaScript", "Python", "CSS", "HTML", "c"),
            ("What is a variable in programming?", "A fixed value", "A storage location with a name", "A type of loop", "A function", "b"),
            ("Which operator is used for equality check in JavaScript?", "=", "==", "===", "!=", "b"),
            ("What does API stand for?", "Application Programming Interface", "Applied Program Integration", "Automatic Protocol Interface", "Application Process Integration", "a"),
            ("What is the time complexity of binary search?", "O(n)", "O(log n)", "O(n²)", "O(1)", "b"),
            ("Which data structure uses FIFO?", "Stack", "Queue", "Array", "Tree", "b"),
            ("What is a database index used for?", "Delete data", "Speed up queries", "Encrypt data", "Backup data", "b"),
            ("Which of these is a frontend framework?", "Django", "Flask", "React", "FastAPI", "c"),
            ("What does SQL stand for?", "Structured Query Language", "Simple Query Language", "Standard Query Language", "Sequential Query Language", "a"),
            ("What is Git used for?", "Compiling code", "Version control", "Debugging", "Deployment", "b"),
            ("Which method sends data in HTTP?", "GET", "POST", "PUT", "DELETE", "b"),
            ("What is a Promise in JavaScript?", "A data type", "An async operation handler", "A loop construct", "A CSS property", "b"),
            ("Which of these is a NoSQL database?", "PostgreSQL", "MySQL", "MongoDB", "SQLite", "c"),
            ("What does CLI stand for?", "Command Line Interface", "Common Language Integration", "Central Logic Interface", "Code Language Index", "a"),
            ("What is an array?", "A function", "A collection of elements", "A CSS class", "An HTML tag", "b"),
            ("Which protocol secures web traffic?", "HTTP", "FTP", "HTTPS", "TCP", "c"),
            ("What is a constructor in OOP?", "A destructor", "A special method to initialize objects", "A type of variable", "A loop", "b"),
            ("What does JSON stand for?", "JavaScript Object Notation", "Java Standard Output", "JavaScript Online Network", "Java Serialized Object Notation", "a"),
            ("Which port does HTTPS use?", "80", "443", "8080", "3000", "b"),
            ("What is a function in programming?", "A reusable block of code", "A variable", "A data type", "An operator", "a"),
            ("What is the DOM?", "Document Object Model", "Data Object Management", "Document Orientation Model", "Digital Output Method", "a"),
            ("Which of these is a Python web framework?", "React", "Angular", "Django", "Vue", "c"),
            ("What is a REST API?", "A type of database", "A stateless API architecture", "A CSS framework", "A JavaScript library", "b"),
            ("What does IDE stand for?", "Integrated Development Environment", "Internal Data Exchange", "Interface Design Engine", "Integrated Debug Environment", "a"),
        ],
        "data-science-ai": [
            ("What is supervised learning?", "Learning without labels", "Learning with labeled data", "Learning by trial and error", "Learning without data", "b"),
            ("What does AI stand for?", "Automated Intelligence", "Artificial Intelligence", "Advanced Integration", "Algorithmic Interface", "b"),
            ("Which library is used for ML in Python?", "React", "scikit-learn", "Express", "jQuery", "b"),
            ("What is a neural network?", "A type of database", "A network of computers", "A computing system inspired by the brain", "A type of cable", "c"),
            ("What is overfitting in ML?", "Model performs well on training but poorly on new data", "Model performs well everywhere", "Model is too simple", "Model has no errors", "a"),
            ("What does NLP stand for?", "Natural Language Processing", "Neural Logic Programming", "Network Layer Protocol", "Natural Logic Processing", "a"),
            ("What is a decision tree?", "A type of neural network", "A tree-like model of decisions", "A database index", "A sorting algorithm", "b"),
            ("Which metric is used for classification?", "Mean Squared Error", "Accuracy", "R-squared", "Standard deviation", "b"),
            ("What is clustering?", "Grouping similar data points", "Sorting data", "Deleting data", "Encrypting data", "a"),
            ("What is a feature in ML?", "A color in an image", "An input variable used for prediction", "An output variable", "A type of model", "b"),
            ("What is regression used for?", "Classification", "Predicting continuous values", "Clustering", "Dimensionality reduction", "b"),
            ("What is gradient descent?", "A type of data", "An optimization algorithm", "A database", "A visualization tool", "b"),
            ("What is a confusion matrix?", "A table describing model performance", "A type of neural network", "A data cleaning tool", "A visualization chart", "a"),
            ("What does PCA stand for?", "Principal Component Analysis", "Primary Classification Algorithm", "Process Control Automation", "Pattern Classification Analysis", "a"),
            ("Which of these is a deep learning framework?", "scikit-learn", "TensorFlow", "Pandas", "Matplotlib", "b"),
            ("What is a hyperparameter?", "A model parameter learned from data", "A configuration set before training", "A type of data", "An evaluation metric", "b"),
            ("What is bias in ML?", "Error due to overly simple assumptions", "Error due to model complexity", "A type of data", "An optimization method", "a"),
            ("What is a dataset split used for?", "Training and testing models", "Encrypting data", "Visualizing data", "Deleting data", "a"),
            ("What is reinforcement learning?", "Learning from labeled data", "Learning from rewards and punishments", "Learning without any data", "Learning from static data", "b"),
            ("What is a Support Vector Machine?", "A classification algorithm", "A type of computer", "A database system", "A web server", "a"),
            ("What does ML stand for?", "Machine Learning", "Modern Logic", "Memory Location", "Markup Language", "a"),
            ("What is cross-validation?", "Training on one dataset only", "A technique to evaluate model generalization", "A type of neural network", "A data cleaning method", "b"),
            ("What is a label in ML?", "An input feature", "The target output in supervised learning", "A type of chart", "A database field", "b"),
            ("What is a training set?", "Data used to train a model", "Data used for final testing", "Data used for deployment", "Random data", "a"),
            ("What is a test set?", "Data used during training", "Data used to evaluate final model", "Data used for feature engineering", "All available data", "b"),
        ],
        "design": [
            ("What is UX design?", "User Experience design", "Universal X-ray design", "Ultra eXtreme design", "Unified XHTML design", "a"),
            ("What does UI stand for?", "User Interface", "Universal Input", "Unique Identifier", "Unified Integration", "a"),
            ("Which tool is popular for UI design?", "Excel", "Figma", "Word", "Chrome", "b"),
            ("What is a wireframe?", "A low-fidelity layout sketch", "A final design", "A code file", "A type of font", "a"),
            ("What is color theory?", "The study of how colors mix in paint", "The science of how colors affect perception", "The study of light waves", "A programming concept", "b"),
            ("What does typography refer to?", "Style and appearance of text", "Type of database", "A coding language", "A design tool", "a"),
            ("What is a prototype in design?", "A fully coded application", "An interactive mockup of a product", "A database schema", "A server configuration", "b"),
            ("What is a grid system used for?", "Layout alignment", "Color selection", "Font pairing", "Image editing", "a"),
            ("What is white space in design?", "Empty space between elements", "A white background", "A CSS property", "An image filter", "a"),
            ("What is responsiveness in web design?", "How fast a page loads", "How well a design adapts to screen sizes", "How colorful a page is", "How many fonts are used", "b"),
            ("What is a design system?", "A collection of reusable components and guidelines", "A type of software", "A programming language", "A color palette", "a"),
            ("What does accessibility mean in design?", "Making designs usable for people with disabilities", "Making designs fast to load", "Making designs colorful", "Making designs responsive", "a"),
            ("What is a user persona?", "A fictional character representing a user type", "A real user", "A design tool", "A programming concept", "a"),
            ("What is information architecture?", "Organizing and structuring content", "Building computer architecture", "Network design", "Database design", "a"),
            ("What is a mood board?", "A collection of design inspirations", "A type of whiteboard", "A code editor", "A prototyping tool", "a"),
            ("What is visual hierarchy?", "Arranging elements by importance", "A type of chart", "A CSS framework", "A database structure", "a"),
            ("What is usability testing?", "Testing how easy a product is to use", "Testing code performance", "Testing network speed", "Testing database queries", "a"),
            ("What does A/B testing compare?", "Two versions of a design", "Two programming languages", "Two databases", "Two servers", "a"),
            ("What is a call-to-action (CTA)?", "A prompt for user to take action", "A phone call", "A type of animation", "A database query", "a"),
            ("What is a design sprint?", "A fast-paced design process", "A type of race", "A code compilation", "A database migration", "a"),
            ("What is contrast in design?", "Difference between elements that makes them stand out", "A type of font", "A color", "An image filter", "a"),
            ("What is a style guide?", "A document of design standards", "A programming manual", "A user manual", "A networking guide", "a"),
            ("What is the golden ratio?", "A mathematical ratio used in design", "A programming ratio", "A database ratio", "A network ratio", "a"),
            ("What is an iteration in design?", "A repeated cycle of improvement", "A single design", "A final product", "A meeting", "a"),
            ("What is a design tool?", "Software for creating designs", "A hardware tool", "A programming language", "A database", "a"),
        ],
        "business": [
            ("What is a business model?", "How a company creates and delivers value", "A type of employee", "An office layout", "A marketing campaign", "a"),
            ("What does ROI stand for?", "Return on Investment", "Rate of Interest", "Return of Inventory", "Revenue on Income", "a"),
            ("What is a startup?", "A newly established business", "A large corporation", "A type of investment", "A marketing strategy", "a"),
            ("What is unit economics?", "Revenue and cost per customer", "Total company revenue", "Stock market analysis", "Employee salaries", "a"),
            ("What is a pitch deck?", "A presentation to investors", "A type of roof", "A sales tool", "A database", "a"),
            ("What is market research?", "Gathering information about target markets", "A type of advertisement", "A sales technique", "A product feature", "a"),
            ("What is a KPI?", "Key Performance Indicator", "Key Product Initiative", "Knowledge Process Integration", "Key Process Input", "a"),
            ("What does B2B stand for?", "Business to Business", "Back to Basics", "Business to Consumer", "Base to Base", "a"),
            ("What is cash flow?", "Movement of money in and out of business", "A type of credit card", "Loan repayment", "Employee salary", "a"),
            ("What is a balance sheet?", "A financial statement summary", "A weighing scale", "A product catalog", "A marketing plan", "a"),
            ("What is a competitive advantage?", "Something that sets a business apart", "A type of discount", "An employee benefit", "A tax deduction", "a"),
            ("What is a value proposition?", "The unique value a product offers", "The price of a product", "A marketing channel", "A distribution method", "a"),
            ("What is revenue?", "Income generated from sales", "Company expenses", "Employee count", "Office space", "a"),
            ("What is profit?", "Revenue minus expenses", "Total sales", "Total costs", "Number of employees", "a"),
            ("What is a target audience?", "The intended group of customers", "Company employees", "Board members", "Suppliers", "a"),
            ("What is marketing?", "Promoting and selling products", "Product manufacturing", "Inventory management", "Hiring employees", "a"),
            ("What is branding?", "Creating a unique identity for a product", "A type of logo", "A pricing strategy", "A distribution channel", "a"),
            ("What is a stakeholder?", "Anyone with interest in a business", "Only shareholders", "Only employees", "Only customers", "a"),
            ("What is a business plan?", "A document outlining business goals", "A type of software", "An office layout", "A hiring document", "a"),
            ("What is e-commerce?", "Buying and selling online", "Electronic components", "A type of email", "A programming language", "a"),
            ("What is a supply chain?", "Network of production and distribution", "A type of store", "A marketing channel", "A software tool", "a"),
            ("What is a budget?", "A financial plan for spending", "A type of bank account", "A loan", "An expense", "a"),
            ("What is an investor?", "Someone who provides capital for returns", "A type of employee", "A customer", "A supplier", "a"),
            ("What is a merger?", "Combining two companies", "Splitting a company", "Closing a company", "Starting a company", "a"),
            ("What is scaling a business?", "Growing the business sustainably", "Reducing business size", "Closing operations", "Changing location", "a"),
        ],
        "personal-development": [
            ("What is a growth mindset?", "Believing abilities can be developed", "A fixed intelligence level", "A type of exercise", "A diet plan", "a"),
            ("What is a goal?", "A desired outcome to achieve", "A daily task", "A type of hobby", "A past event", "a"),
            ("What is time management?", "Planning how to use time effectively", "Watching time pass", "Working all day", "A clock", "a"),
            ("What is procrastination?", "Delaying important tasks", "Completing tasks early", "Planning ahead", "Setting goals", "a"),
            ("What is a habit?", "A regular repeated behavior", "A one-time action", "A type of food", "A daily schedule", "a"),
            ("What is mindfulness?", "Being present and aware", "Thinking about the past", "Planning the future", "Multitasking", "a"),
            ("What is emotional intelligence?", "Ability to understand and manage emotions", "A high IQ", "A personality type", "A learning style", "a"),
            ("What is networking?", "Building professional relationships", "Computer networking", "A type of cable", "Internet connection", "a"),
            ("What is a personal brand?", "How you present yourself to the world", "A company brand", "A product label", "A logo", "a"),
            ("What is resilience?", "Ability to recover from setbacks", "A type of strength training", "A personality flaw", "A memory technique", "a"),
            ("What is active listening?", "Fully concentrating on what is being said", "Hearing background noise", "Taking notes while talking", "Speaking loudly", "a"),
            ("What is a priority?", "Something ranked as more important", "A type of task", "A schedule", "A deadline", "a"),
            ("What is self-reflection?", "Examining your own thoughts and actions", "Looking in a mirror", "Reading a book", "Writing a report", "a"),
            ("What is stress management?", "Techniques to cope with stress", "Avoiding all work", "Ignoring problems", "Taking medication", "a"),
            ("What is a skill?", "Ability learned through practice", "A natural talent", "A type of job", "A personality trait", "a"),
            ("What is a mentor?", "Someone who guides your development", "A type of teacher", "A manager", "A friend", "a"),
            ("What is feedback?", "Information about performance", "A type of noise", "A report card", "A criticism", "a"),
            ("What is work-life balance?", "Balance between career and personal life", "Working all the time", "No personal time", "Only personal time", "a"),
            ("What is continuous learning?", "Ongoing skill development", "Finishing school", "A one-time course", "Reading one book", "a"),
            ("What is a career goal?", "A professional objective to achieve", "A daily task", "A hobby", "A vacation plan", "a"),
            ("What is self-discipline?", "Ability to control impulses and stay focused", "A personality trait", "A type of punishment", "A rule", "a"),
            ("What is confidence?", "Belief in your own abilities", "Arrogance", "A skill", "A personality", "a"),
            ("What is leadership?", "Guiding and inspiring others", "Bossing people around", "A job title", "A salary grade", "a"),
            ("What is a routine?", "A regular sequence of activities", "A one-time event", "A type of exercise", "A diet plan", "a"),
            ("What is well-being?", "State of being comfortable and healthy", "Wealth", "Fame", "Popularity", "a"),
        ],
    }

    for course in all_courses:
        cat_slug = course.category.slug
        # map category slugs to pool keys
        if cat_slug in ("development",):
            pool_key = "development"
        elif cat_slug in ("data-science-ai",):
            pool_key = "data-science-ai"
        elif cat_slug in ("design",):
            pool_key = "design"
        elif cat_slug in ("business",):
            pool_key = "business"
        else:
            pool_key = "personal-development"

        pool = question_pool[pool_key]
        random.seed(course.id)
        selected = random.sample(pool, min(20, len(pool)))
        for q_text, opt_a, opt_b, opt_c, opt_d, correct in selected:
            db.add(models.Question(
                course_id=course.id,
                question_text=q_text,
                option_a=opt_a,
                option_b=opt_b,
                option_c=opt_c,
                option_d=opt_d,
                correct_option=correct,
            ))

    # ---------- Some enrollments + reviews so the demo doesn't look empty ----------
    sample_reviews = [
        (5, "Really clear explanations, loved the projects."),
        (4, "Solid course, pacing could be a bit faster."),
        (5, "Exactly what I needed for placements prep."),
        (3, "Good content but examples felt a bit dated."),
        (5, "Instructor explains concepts really well."),
    ]
    for student in students:
        for course in random.sample(all_courses, k=min(4, len(all_courses))):
            db.add(models.Enrollment(user_id=student.id, course_id=course.id))
            if random.random() > 0.3:
                rating, comment = random.choice(sample_reviews)
                db.add(models.Review(
                    user_id=student.id, course_id=course.id,
                    rating=rating, comment=comment,
                ))

    db.commit()
