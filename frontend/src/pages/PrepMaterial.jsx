import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BookOpen, ChevronDown, ChevronUp, Brain, Code2, Database, Globe,
  Server, Users, FileText, Layers, Star, ExternalLink, Lightbulb,
  Shield, Cpu, Network, HardDrive, Monitor,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const PREP_DATA = {
  viva: {
    label: "Viva / Core CS",
    icon: Brain,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    sections: [
      {
        title: "Operating Systems",
        icon: "🖥️",
        questions: [
          { q: "What is a process vs a thread?", a: "A process is an independent program in execution with its own memory space. A thread is the smallest unit of execution within a process; threads share the same memory space. Processes are heavier and have more overhead." },
          { q: "What is a deadlock? What are its necessary conditions?", a: "Deadlock is a state where processes wait indefinitely for resources. Conditions: 1) Mutual Exclusion, 2) Hold & Wait, 3) No Preemption, 4) Circular Wait. All 4 must hold simultaneously." },
          { q: "What is virtual memory?", a: "Virtual memory allows processes to use more memory than physically available by using disk space as an extension of RAM. OS uses paging/segmentation to manage this." },
          { q: "Explain paging vs segmentation.", a: "Paging divides memory into fixed-size pages; no external fragmentation but has internal fragmentation. Segmentation divides into variable-size logical units; no internal fragmentation but has external fragmentation." },
          { q: "What is a context switch?", a: "Context switch is the process of saving the state (registers, program counter) of a currently running process and loading the state of the next process to be executed." },
          { q: "What are semaphores? Difference between mutex and semaphore?", a: "Semaphore is a synchronization primitive. Mutex (binary semaphore) is owned by the thread that locks it and only that thread can unlock it. Counting semaphore allows multiple threads to access a resource." },
          { q: "What is thrashing?", a: "Thrashing occurs when a process spends more time paging (swapping) than executing. It happens when there's insufficient physical memory and too many processes compete for it." },
          { q: "Explain Round Robin scheduling.", a: "Each process gets a fixed time slot (quantum). After quantum expires, the process is preempted and put at the end of the ready queue. Good for time-sharing systems." },
        ],
      },
      {
        title: "DBMS / SQL",
        icon: "🗄️",
        questions: [
          { q: "What is ACID in databases?", a: "Atomicity (all or nothing), Consistency (valid state before/after), Isolation (transactions don't interfere), Durability (committed changes persist even after failure)." },
          { q: "What are database normalization forms?", a: "1NF: Atomic values, no repeating groups. 2NF: 1NF + no partial dependency. 3NF: 2NF + no transitive dependency. BCNF: Every determinant is a candidate key." },
          { q: "Difference between INNER JOIN, LEFT JOIN, RIGHT JOIN?", a: "INNER JOIN: Only matching rows. LEFT JOIN: All left table rows + matching right. RIGHT JOIN: All right table rows + matching left. FULL JOIN: All rows from both tables." },
          { q: "What is an index? Types of indexes?", a: "Index speeds up SELECT queries. Types: Clustered (sorts data physically, one per table), Non-clustered (separate structure with pointers, multiple allowed), Composite, Full-text, Hash." },
          { q: "What is a transaction? How does rollback work?", a: "A transaction is a sequence of operations as a single unit. If any step fails, ROLLBACK undoes all changes made during the transaction. COMMIT saves all changes permanently." },
          { q: "What is the difference between DELETE, TRUNCATE, DROP?", a: "DELETE: Removes specific rows, can be rolled back, triggers fire. TRUNCATE: Removes all rows faster, cannot be rolled back, resets identity. DROP: Removes the entire table structure." },
          { q: "Explain NoSQL vs SQL databases.", a: "SQL: Structured, relational, ACID, fixed schema (MySQL, PostgreSQL). NoSQL: Flexible schema, horizontally scalable, BASE model — document (MongoDB), key-value (Redis), column (Cassandra), graph (Neo4j)." },
        ],
      },
      {
        title: "Computer Networks",
        icon: "🌐",
        questions: [
          { q: "What are the OSI model layers?", a: "7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application. Mnemonic: 'Please Do Not Throw Sausage Pizza Away'." },
          { q: "What is TCP vs UDP?", a: "TCP: Connection-oriented, reliable, ordered delivery, flow/congestion control (HTTP, FTP). UDP: Connectionless, faster, no guarantee of delivery (video streaming, DNS, gaming)." },
          { q: "What happens when you type a URL in a browser?", a: "1) DNS lookup for IP. 2) TCP handshake. 3) TLS/SSL handshake (HTTPS). 4) HTTP request sent. 5) Server processes & responds. 6) Browser renders HTML/CSS/JS." },
          { q: "What is the difference between HTTP and HTTPS?", a: "HTTP is unencrypted (port 80). HTTPS uses SSL/TLS encryption (port 443), ensuring data confidentiality, integrity, and server authentication." },
          { q: "What is a subnet mask and CIDR?", a: "Subnet mask divides IP into network + host portions (e.g., 255.255.255.0). CIDR notation /24 means 24 bits for network. Used to create subnets and reduce routing table size." },
          { q: "What is DNS? How does it work?", a: "DNS (Domain Name System) converts domain names to IP addresses. Process: Browser → Local cache → Recursive resolver → Root server → TLD server → Authoritative server → IP returned." },
        ],
      },
      {
        title: "OOP Concepts",
        icon: "🧩",
        questions: [
          { q: "What are the 4 pillars of OOP?", a: "Encapsulation (bundling data + methods, access control), Inheritance (child class inherits parent), Polymorphism (same interface, different behavior), Abstraction (hiding implementation details)." },
          { q: "What is method overloading vs overriding?", a: "Overloading: Same method name, different parameters in same class (compile-time polymorphism). Overriding: Child class redefines parent method with same signature (runtime polymorphism)." },
          { q: "What is an abstract class vs interface?", a: "Abstract class can have partial implementation, instance variables, constructors. Interface defines a contract with only abstract methods (Java 8+ allows default methods). A class can implement multiple interfaces." },
          { q: "What is the difference between == and equals() in Java?", a: "== compares references (memory addresses). equals() compares actual content/values. For objects, always use equals() for value comparison." },
          { q: "What is a constructor? Types?", a: "Constructor initializes an object when created. Types: Default (no args), Parameterized (with args), Copy (takes same class object, creates copy). Constructor name = class name, no return type." },
          { q: "What is a static method/variable?", a: "Static members belong to the class, not instances. Shared across all instances. Static methods can't access instance variables directly. Used for utility methods (Math.sqrt())." },
        ],
      },
    ],
  },

  dsa: {
    label: "DSA Interview Prep",
    icon: Code2,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    sections: [
      {
        title: "Arrays & Strings",
        icon: "📊",
        questions: [
          { q: "How to find the maximum subarray sum?", a: "Kadane's Algorithm: Iterate through array maintaining current_sum = max(arr[i], current_sum + arr[i]) and track max_sum. Time: O(n), Space: O(1)." },
          { q: "How to check if a string is a palindrome?", a: "Use two pointers — one from start, one from end — moving inward and comparing characters. Time: O(n), Space: O(1). For ignoring case/non-alphanumeric, preprocess first." },
          { q: "Two Sum problem — optimal approach?", a: "Use a hash map. Store each number and its index. For each element, check if (target - element) exists in map. Time: O(n), Space: O(n)." },
          { q: "How to rotate an array by k positions?", a: "Method: Reverse entire array, then reverse first k elements, then reverse remaining. Time: O(n), Space: O(1). Alternative: use extra array O(n) space." },
          { q: "Sliding Window technique — when to use?", a: "Use when you need to find a subarray/substring of fixed or variable length satisfying a condition. Avoid O(n²) nested loops. Examples: max sum of size k, longest substring without repeating chars." },
        ],
      },
      {
        title: "Linked Lists",
        icon: "🔗",
        questions: [
          { q: "How to detect a cycle in a linked list?", a: "Floyd's Cycle Detection (Tortoise & Hare): Use slow (1 step) and fast (2 steps) pointers. If they meet, cycle exists. Time: O(n), Space: O(1)." },
          { q: "How to reverse a linked list?", a: "Iterative: Use prev=null, curr=head. At each step: save next, point curr.next to prev, move prev to curr, move curr to next. Time: O(n), Space: O(1)." },
          { q: "Find the middle element of a linked list.", a: "Use slow and fast pointers. When fast reaches end, slow is at the middle. Time: O(n), Space: O(1)." },
          { q: "Merge two sorted linked lists.", a: "Use a dummy node. Compare heads of both lists, append the smaller one, advance that pointer. Continue until one list is exhausted, then append the rest. Time: O(m+n)." },
        ],
      },
      {
        title: "Trees & Graphs",
        icon: "🌳",
        questions: [
          { q: "BFS vs DFS — when to use each?", a: "BFS (queue): Shortest path in unweighted graphs, level-order traversal. DFS (stack/recursion): Cycle detection, topological sort, finding connected components, when solution is deep." },
          { q: "What is a balanced BST? Why is balance important?", a: "A BST where the height difference of left and right subtrees is at most 1 (AVL tree) or within bounds (Red-Black). Balance ensures O(log n) search/insert/delete. Unbalanced BST degrades to O(n)." },
          { q: "Detect cycle in a directed graph.", a: "DFS with a 'visiting' color set. If DFS revisits a node currently in the recursion stack (gray/visiting state), a cycle exists. Time: O(V+E)." },
          { q: "What is Dijkstra's algorithm?", a: "Finds shortest path from source to all nodes in weighted graph with non-negative edges. Uses a min-heap priority queue. Time: O((V+E) log V). Doesn't work with negative edge weights." },
          { q: "What is dynamic programming?", a: "DP solves problems by breaking them into subproblems and storing results (memoization/tabulation) to avoid recomputation. Used when: overlapping subproblems + optimal substructure. Examples: 0/1 knapsack, Fibonacci, LCS." },
        ],
      },
      {
        title: "Sorting & Searching",
        icon: "🔍",
        questions: [
          { q: "Compare sorting algorithms.", a: "QuickSort: O(n log n) avg, O(n²) worst, in-place. MergeSort: O(n log n) all cases, stable, O(n) space. HeapSort: O(n log n), in-place, not stable. TimSort (Python/Java): O(n log n), stable, adaptive." },
          { q: "When to use Binary Search?", a: "Use on sorted arrays. Reduce search space by half each step. Also applicable to: search in rotated array, finding first/last occurrence, minimize/maximize problems (binary search on answer)." },
          { q: "What is the time complexity of HashMap operations?", a: "Average: O(1) for get/put/delete. Worst case: O(n) when all keys hash to same bucket (collision). Good hash function + load factor management keeps it O(1) amortized." },
        ],
      },
    ],
  },

  system: {
    label: "System Design",
    icon: Server,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    sections: [
      {
        title: "Core Concepts",
        icon: "⚙️",
        questions: [
          { q: "What is horizontal vs vertical scaling?", a: "Vertical: Add more resources (CPU/RAM) to one machine. Has limits. Horizontal: Add more machines and distribute load. More flexible, requires load balancer." },
          { q: "What is a load balancer?", a: "Distributes incoming traffic across multiple servers. Algorithms: Round Robin, Least Connections, IP Hash. Examples: Nginx, AWS ALB, HAProxy. Prevents single server overload." },
          { q: "What is caching? When to use it?", a: "Store frequently accessed data in fast storage (Redis, Memcached). Use when: read-heavy workload, expensive computations, repeated queries. Strategies: Cache-aside, Write-through, Write-back." },
          { q: "What is a CDN?", a: "Content Delivery Network distributes static assets (images, videos, CSS) across geographically distributed servers (edge nodes). Users load from nearest node, reducing latency. Examples: Cloudflare, AWS CloudFront." },
          { q: "What is database sharding?", a: "Horizontal partitioning of data across multiple databases. Each shard holds a subset of data. Shard key determines which shard a record goes to. Improves scalability but adds complexity." },
          { q: "How do you design a URL shortener?", a: "Components: API (POST /shorten, GET /{code}), DB to store long URL → short code mapping, ID generator (base62 encoding), Cache (Redis for popular URLs), CDN. Handle: redirects (301/302), expiry, analytics." },
        ],
      },
      {
        title: "Microservices & APIs",
        icon: "🔌",
        questions: [
          { q: "Monolith vs Microservices?", a: "Monolith: Single deployable unit, simple to develop/test, harder to scale independently. Microservices: Independent services, tech-agnostic, independent scaling, but adds complexity (service discovery, distributed tracing, network calls)." },
          { q: "What is REST vs GraphQL?", a: "REST: Multiple endpoints, fixed response structure, over/under-fetching possible. GraphQL: Single endpoint, client specifies exact data needed, reduces over-fetching, good for complex/variable queries." },
          { q: "What is message queue? Give examples and use cases.", a: "Queue decouples producers and consumers. Examples: RabbitMQ, Apache Kafka, AWS SQS. Use cases: async processing, email/SMS notifications, order processing, log aggregation, microservices communication." },
        ],
      },
    ],
  },

  hr: {
    label: "HR & Behavioral",
    icon: Users,
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-200",
    sections: [
      {
        title: "Common HR Questions",
        icon: "🤝",
        questions: [
          { q: "Tell me about yourself.", a: "Structure: Name → Education → Key skills/tech stack → Projects/internships → What you're looking for. Keep it 1-2 minutes. Focus on relevant achievements, not personal life." },
          { q: "Why do you want to join this company?", a: "Research the company beforehand! Mention: specific product/mission you admire, tech stack they use, company culture, growth opportunities. Avoid: 'good salary' or 'brand name' as primary reason." },
          { q: "What is your greatest weakness?", a: "Be genuine but strategic. Mention a real weakness that is NOT critical for the role, and always follow with what you're doing to overcome it. E.g., 'I tend to over-research before starting. I now timeBox research to 30 mins.'" },
          { q: "Where do you see yourself in 5 years?", a: "Show ambition aligned with the company. E.g., 'I want to deepen my backend expertise, take on technical leadership, and contribute to impactful products.' Avoid 'starting my own company'." },
          { q: "Describe a challenging project.", a: "Use STAR method: Situation, Task, Action, Result. Describe the challenge clearly, YOUR specific contribution, and the measurable outcome. Have 2-3 such stories ready." },
          { q: "Do you have any questions for us?", a: "Always ask questions! Good ones: 'What does the onboarding process look like?', 'What are the biggest technical challenges the team is facing?', 'How is code review done here?', 'What growth opportunities exist for new hires?'" },
        ],
      },
      {
        title: "Situational / Leadership",
        icon: "🎯",
        questions: [
          { q: "How do you handle disagreements with teammates?", a: "Focus on facts and impact, not opinions. Listen to understand their point. Propose a structured discussion. If unresolved, escalate respectfully or agree to try both approaches on a small scale first." },
          { q: "Tell me about a time you failed.", a: "Show self-awareness and learning. Describe the failure briefly, take responsibility (don't blame others), explain what you learned, and how you applied that learning afterward." },
          { q: "How do you prioritize tasks when you have multiple deadlines?", a: "Use priority frameworks (Eisenhower Matrix, MoSCoW). Communicate proactively with stakeholders. Break large tasks into milestones. Mention any tools (Jira, Notion, Trello) you use." },
        ],
      },
    ],
  },

  resume: {
    label: "Resume & Tips",
    icon: FileText,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    sections: [
      {
        title: "Resume Best Practices",
        icon: "📄",
        questions: [
          { q: "What should a strong tech resume include?", a: "1) Contact info + LinkedIn/GitHub. 2) Skills (languages, frameworks, tools, cloud). 3) Education. 4) Projects (name, tech stack, impact). 5) Work experience/internships. 6) Achievements (competitive programming, certifications). Keep it 1 page for freshers." },
          { q: "How to write impact-driven project descriptions?", a: "Use format: 'Built/Developed/Designed X using [tech] that resulted in Y.' Always quantify: 'Reduced load time by 40%', 'Handled 1000 concurrent users', 'Improved API response by 200ms'. Avoid vague phrases like 'worked on backend'." },
          { q: "What skills should a fresher highlight?", a: "DSA problem-solving (mention competitive profiles: Codeforces, LeetCode rating). Languages (Java/Python/C++). Frameworks (React, Node, Spring). Databases (MySQL, MongoDB). Tools (Git, Docker, AWS basics). Soft skills." },
          { q: "Should I include personal projects or college projects?", a: "Yes! Personal projects show initiative. Ensure: it's working/deployed, has a GitHub link with README, demonstrates real features (not just CRUD). College projects are fine if they have some complexity." },
        ],
      },
      {
        title: "Pre-Interview Preparation",
        icon: "🚀",
        questions: [
          { q: "How to prepare 1 week before an interview?", a: "Day 1-2: Revise core DSA patterns (arrays, two pointers, trees, DP). Day 3: System design basics. Day 4: Company-specific LeetCode problems. Day 5: OS/DBMS/CN viva. Day 6: Mock interview. Day 7: Rest + review your projects." },
          { q: "What is the best way to practice coding interviews?", a: "1) Solve on LeetCode (start Easy → Medium → Hard). 2) Time yourself (45 min per problem). 3) Practice thinking aloud. 4) Study patterns, not individual problems. 5) Do mock interviews on Pramp or with friends." },
          { q: "How do you approach an unknown problem in an interview?", a: "1) Clarify input/output/constraints. 2) Think of brute force first. 3) Optimize step by step. 4) Consider edge cases. 5) Write clean code. 6) Test with examples. Talk throughout — interviewers value thought process over perfect code." },
        ],
      },
    ],
  },
};

const TABS = Object.keys(PREP_DATA);

// ─── Components ───────────────────────────────────────────────────────────────
function QAItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${open ? "border-blue-200 bg-blue-50/30" : "border-slate-100 bg-white hover:border-slate-200"}`}>
      <button
        className="w-full flex items-start justify-between gap-3 px-4 py-3.5 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-sm font-semibold text-slate-800 flex-1">{q}</span>
        <span className="shrink-0 mt-0.5 text-slate-400">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="h-px bg-blue-100 mb-3" />
          <p className="text-sm text-slate-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

function Section({ section }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="mb-6">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center gap-2 mb-3 group text-left"
      >
        <span className="text-xl">{section.icon}</span>
        <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors flex-1">{section.title}</h3>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{section.questions.length} Q&A</span>
        {collapsed ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronUp size={16} className="text-slate-400" />}
      </button>
      {!collapsed && (
        <div className="flex flex-col gap-2">
          {section.questions.map((qa, i) => <QAItem key={i} q={qa.q} a={qa.a} />)}
        </div>
      )}
    </div>
  );
}

const TAB_TO_CATEGORY = {
  viva: "Viva / Core CS",
  dsa: "DSA",
  system: "System Design",
  hr: "HR & Behavioral",
  resume: "Resume & Tips",
};

const TYPE_COLORS = {
  "Notes":         "bg-blue-100 text-blue-700",
  "Q&A":           "bg-purple-100 text-purple-700",
  "Tips":          "bg-amber-100 text-amber-700",
  "Resource Link": "bg-green-100 text-green-700",
};

function TeacherCard({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ca-card p-4 border-l-4 border-emerald-400">
      <div
        className="flex items-start justify-between gap-2 cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[item.type] || "bg-slate-100 text-slate-600"}`}>
              {item.type}
            </span>
            {item.difficulty && (
              <span className="text-xs text-slate-500 font-medium">{item.difficulty}</span>
            )}
            <span className="text-xs text-slate-400">by {item.createdByUsername}</span>
          </div>
          <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
          {item.topic && <p className="text-xs text-slate-500 mt-0.5">Topic: {item.topic}</p>}
        </div>
        <ChevronDown size={16} className={`text-slate-400 shrink-0 mt-1 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{item.content}</p>
          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {item.tags.map(t => (
                <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PrepMaterial() {
  const [activeTab, setActiveTab] = useState("viva");
  const [teacherMaterials, setTeacherMaterials] = useState([]);
  const [tmLoading, setTmLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/prep")
      .then(r => setTeacherMaterials(r.data.materials || []))
      .catch(() => {})
      .finally(() => setTmLoading(false));
  }, []);

  const tab = PREP_DATA[activeTab];
  const TabIcon = tab.icon;

  const totalQA = Object.values(PREP_DATA).reduce(
    (sum, t) => sum + t.sections.reduce((s, sec) => s + sec.questions.length, 0), 0
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <BookOpen size={26} className="text-emerald-600" />
            Placement Preparation
          </h1>
          <p className="page-subtitle">Curated study material for interviews — viva, DSA, system design & more</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge bg-emerald-100 text-emerald-700 border border-emerald-200">
            {totalQA}+ Q&A
          </span>
        </div>
      </div>

      {/* Quick stats banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Brain, label: "Core CS Viva", count: PREP_DATA.viva.sections.reduce((s, sec) => s + sec.questions.length, 0), color: "text-purple-600", bg: "bg-purple-50" },
          { icon: Code2, label: "DSA Patterns", count: PREP_DATA.dsa.sections.reduce((s, sec) => s + sec.questions.length, 0), color: "text-blue-600", bg: "bg-blue-50" },
          { icon: Server, label: "System Design", count: PREP_DATA.system.sections.reduce((s, sec) => s + sec.questions.length, 0), color: "text-green-600", bg: "bg-green-50" },
          { icon: Users, label: "HR Questions", count: PREP_DATA.hr.sections.reduce((s, sec) => s + sec.questions.length, 0), color: "text-pink-600", bg: "bg-pink-50" },
        ].map(({ icon: Icon, label, count, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4 border border-white/50 shadow-sm`}>
            <Icon size={20} className={`${color} mb-2`} />
            <p className={`text-lg font-bold ${color}`}>{count}+</p>
            <p className="text-xs text-slate-600 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-6 flex-wrap">
        {TABS.map(key => {
          const t = PREP_DATA[key];
          const Icon = t.icon;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-t-lg border border-b-0 transition-all ${
                activeTab === key
                  ? `${t.bg} ${t.color} ${t.border}`
                  : "text-slate-500 hover:text-slate-800 border-transparent"
              }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Q&A */}
        <div className="lg:col-span-3">
          {tab.sections.map((section, i) => <Section key={i} section={section} />)}

          {/* Teacher-created materials for this tab */}
          {(() => {
            const filtered = teacherMaterials.filter(
              m => m.category === TAB_TO_CATEGORY[activeTab]
            );
            if (tmLoading) return null;
            if (filtered.length === 0) return null;
            return (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">
                  <BookOpen size={15} /> From Your Teachers ({filtered.length})
                </h3>
                <div className="flex flex-col gap-3">
                  {filtered.map(item => <TeacherCard key={item._id} item={item} />)}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Sidebar — study tips */}
        <div className="flex flex-col gap-4">
          <div className={`${tab.bg} border ${tab.border} rounded-2xl p-5`}>
            <p className={`text-sm font-bold ${tab.color} mb-3 flex items-center gap-1.5`}>
              <Lightbulb size={15} /> Study Tips
            </p>
            <ul className="text-xs text-slate-600 space-y-2">
              {activeTab === "viva" && <>
                <li>• Revise OS, DBMS, CN, OOP in that priority order</li>
                <li>• Draw diagrams when explaining (OSI layers, memory layout)</li>
                <li>• Know your college subjects deeply — professors focus there</li>
                <li>• Practice explaining concepts without jargon</li>
              </>}
              {activeTab === "dsa" && <>
                <li>• Learn patterns, not individual solutions</li>
                <li>• Always start with brute force, then optimize</li>
                <li>• Analyze time and space complexity for every solution</li>
                <li>• Practice on LeetCode: Easy (30%) → Medium (60%) → Hard (10%)</li>
                <li>• Top patterns: Sliding Window, Two Pointers, DFS/BFS, DP</li>
              </>}
              {activeTab === "system" && <>
                <li>• Ask clarifying questions before designing</li>
                <li>• Start with requirements → high-level → deep dive</li>
                <li>• Know CAP theorem: Consistency, Availability, Partition tolerance</li>
                <li>• Think about scale: 1K → 1M → 1B requests/day</li>
              </>}
              {activeTab === "hr" && <>
                <li>• Prepare 5 STAR stories from your projects</li>
                <li>• Research the company's products and recent news</li>
                <li>• Practice out loud, not just in your head</li>
                <li>• Be specific — avoid generic vague answers</li>
              </>}
              {activeTab === "resume" && <>
                <li>• Use a clean, ATS-friendly template (no tables/graphics)</li>
                <li>• Use action verbs: Built, Designed, Optimized, Led</li>
                <li>• Quantify everything you can</li>
                <li>• Keep it 1 page (fresher) or 2 pages (3+ years exp)</li>
              </>}
            </ul>
          </div>

          {/* External Resources */}
          <div className="ca-card p-4">
            <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
              <ExternalLink size={14} /> Useful Resources
            </p>
            <ul className="text-xs text-slate-500 space-y-2">
              {activeTab === "dsa" && <>
                <li>• <a href="https://leetcode.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">LeetCode</a> — Practice problems</li>
                <li>• <a href="https://visualgo.net" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">VisuAlgo</a> — Algorithm visualizer</li>
                <li>• <a href="https://www.geeksforgeeks.org" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">GeeksforGeeks</a> — Theory + examples</li>
              </>}
              {activeTab === "system" && <>
                <li>• <a href="https://github.com/donnemartin/system-design-primer" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">System Design Primer</a> — GitHub</li>
                <li>• <a href="https://highscalability.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">High Scalability</a> — Real architectures</li>
              </>}
              {activeTab === "viva" && <>
                <li>• <a href="https://www.interviewbit.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">InterviewBit</a> — MC questions</li>
                <li>• <a href="https://www.geeksforgeeks.org/last-minute-notes/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">GFG Last Minute Notes</a></li>
              </>}
              {(activeTab === "hr" || activeTab === "resume") && <>
                <li>• <a href="https://www.pramp.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Pramp</a> — Mock interviews</li>
                <li>• <a href="https://resumeworded.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Resume Worded</a> — Resume scorer</li>
                <li>• <a href="https://grow.google/certificates/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Google Career Certificates</a></li>
              </>}
              <li>• Use the Problems section in this platform to practice!</li>
            </ul>
          </div>

          {/* Placement timeline */}
          <div className="ca-card p-4">
            <p className="text-sm font-bold text-slate-700 mb-3">📅 Placement Timeline</p>
            <div className="space-y-2 text-xs">
              {[
                { week: "Wk 1-2", task: "DSA Foundations (Arrays, Strings, Linked Lists)", color: "bg-blue-400" },
                { week: "Wk 3-4", task: "Trees, Graphs, Recursion", color: "bg-indigo-400" },
                { week: "Wk 5",   task: "Dynamic Programming", color: "bg-purple-400" },
                { week: "Wk 6",   task: "OS, DBMS, CN, OOP Viva", color: "bg-orange-400" },
                { week: "Wk 7",   task: "System Design Basics", color: "bg-green-400" },
                { week: "Wk 8",   task: "Mock Interviews + HR Prep", color: "bg-pink-400" },
              ].map(({ week, task, color }) => (
                <div key={week} className="flex items-start gap-2">
                  <span className={`${color} text-white rounded px-1.5 py-0.5 font-semibold shrink-0`}>{week}</span>
                  <span className="text-slate-600">{task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
