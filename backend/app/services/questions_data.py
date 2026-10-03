"""
30 original GATE-style Computer Science questions.
These are original questions inspired by GATE CSE topic areas.
NOT copied from any official GATE paper.
"""

QUESTIONS = [
    # ── DATA STRUCTURES ──────────────────────────────────────────────────────
    {
        "question_text": (
            "A min-heap contains n elements. What is the time complexity of extracting "
            "the minimum element and restoring the heap property?"
        ),
        "option_a": "O(1)",
        "option_b": "O(log n)",
        "option_c": "O(n)",
        "option_d": "O(n log n)",
        "correct_answer": 1,
        "explanation": (
            "Extracting the root (minimum) takes O(1), but re-heapifying by sifting "
            "down the replacement element takes O(log n) since the heap height is log n."
        ),
        "topic": "Data Structures",
        "difficulty": "easy",
    },
    {
        "question_text": (
            "In an AVL tree with n nodes, the worst-case height is bounded by which expression?"
        ),
        "option_a": "O(n)",
        "option_b": "O(√n)",
        "option_c": "O(log n)",
        "option_d": "O(n²)",
        "correct_answer": 2,
        "explanation": (
            "AVL trees maintain balance factor ≤1 at every node, guaranteeing height "
            "O(log n). Fibonacci trees show the worst-case height ≈ 1.44 log₂(n+2)."
        ),
        "topic": "Data Structures",
        "difficulty": "easy",
    },
    {
        "question_text": (
            "Which of the following data structures is most suitable for implementing "
            "a Least Recently Used (LRU) cache with O(1) get and put operations?"
        ),
        "option_a": "Array + Binary Search",
        "option_b": "Stack",
        "option_c": "Hash Map + Doubly Linked List",
        "option_d": "Min-Heap",
        "correct_answer": 2,
        "explanation": (
            "An LRU cache requires O(1) lookup and O(1) move-to-front. A HashMap "
            "provides O(1) lookup by key and a doubly linked list allows O(1) "
            "insertion/deletion when given the node pointer."
        ),
        "topic": "Data Structures",
        "difficulty": "medium",
    },
    {
        "question_text": (
            "Consider a graph represented as an adjacency matrix with V vertices and E edges. "
            "What is the space complexity of this representation?"
        ),
        "option_a": "O(V + E)",
        "option_b": "O(E)",
        "option_c": "O(V²)",
        "option_d": "O(V × E)",
        "correct_answer": 2,
        "explanation": (
            "An adjacency matrix stores a V×V boolean/weight matrix regardless of the "
            "number of edges, so its space is O(V²). An adjacency list would use O(V+E)."
        ),
        "topic": "Data Structures",
        "difficulty": "easy",
    },

    # ── ALGORITHMS ───────────────────────────────────────────────────────────
    {
        "question_text": (
            "Quicksort chooses the first element as the pivot on an already sorted array "
            "of n elements. What is the time complexity of this run?"
        ),
        "option_a": "O(n log n)",
        "option_b": "O(n)",
        "option_c": "O(n²)",
        "option_d": "O(log n)",
        "correct_answer": 2,
        "explanation": (
            "Picking the first element as pivot on a sorted array creates maximally "
            "unbalanced partitions (0 and n-1 elements), resulting in O(n²) comparisons."
        ),
        "topic": "Algorithms",
        "difficulty": "easy",
    },
    {
        "question_text": (
            "Which algorithmic paradigm does Dijkstra's shortest path algorithm follow?"
        ),
        "option_a": "Dynamic Programming",
        "option_b": "Divide and Conquer",
        "option_c": "Backtracking",
        "option_d": "Greedy",
        "correct_answer": 3,
        "explanation": (
            "Dijkstra's algorithm greedily selects the unvisited vertex with the smallest "
            "tentative distance at each step, making it a greedy algorithm."
        ),
        "topic": "Algorithms",
        "difficulty": "easy",
    },
    {
        "question_text": (
            "The recurrence T(n) = 2T(n/2) + O(n) describes the time complexity of "
            "Merge Sort. Using the Master Theorem, its solution is:"
        ),
        "option_a": "O(n)",
        "option_b": "O(n log n)",
        "option_c": "O(n²)",
        "option_d": "O(log n)",
        "correct_answer": 1,
        "explanation": (
            "a=2, b=2, f(n)=O(n), n^(log_b a)=n^1=n. Since f(n)=Θ(n^log_b a), "
            "we are in Case 2 of the Master Theorem: T(n)=Θ(n log n)."
        ),
        "topic": "Algorithms",
        "difficulty": "medium",
    },
    {
        "question_text": (
            "The 0/1 Knapsack problem with n items and capacity W is solved using "
            "dynamic programming. What is its time complexity?"
        ),
        "option_a": "O(n log W)",
        "option_b": "O(2ⁿ)",
        "option_c": "O(nW)",
        "option_d": "O(n²)",
        "correct_answer": 2,
        "explanation": (
            "The DP table has n×W cells, each filled in O(1). Total time is O(nW). "
            "This is pseudo-polynomial because W is not polynomial in the input size."
        ),
        "topic": "Algorithms",
        "difficulty": "medium",
    },

    # ── OPERATING SYSTEMS ────────────────────────────────────────────────────
    {
        "question_text": (
            "In the context of virtual memory, which page replacement algorithm "
            "is provably optimal (fewest page faults) but not implementable online?"
        ),
        "option_a": "LRU (Least Recently Used)",
        "option_b": "FIFO (First In First Out)",
        "option_c": "Optimal (OPT / Bélády's Algorithm)",
        "option_d": "Clock Algorithm",
        "correct_answer": 2,
        "explanation": (
            "Bélády's Optimal algorithm replaces the page that will not be used for "
            "the longest time in the future, guaranteeing fewest faults. It requires "
            "future knowledge, making it non-implementable in practice."
        ),
        "topic": "Operating Systems",
        "difficulty": "medium",
    },
    {
        "question_text": (
            "A process has been granted CPU time but is waiting for I/O. In which "
            "state does an OS scheduler typically place this process?"
        ),
        "option_a": "Ready",
        "option_b": "Running",
        "option_c": "Blocked (Waiting)",
        "option_d": "Terminated",
        "correct_answer": 2,
        "explanation": (
            "When a process initiates an I/O request it cannot continue execution, "
            "so the OS moves it to the Blocked/Waiting state until I/O completes."
        ),
        "topic": "Operating Systems",
        "difficulty": "easy",
    },
    {
        "question_text": (
            "Deadlock can occur only when all four Coffman conditions hold simultaneously. "
            "Which of the following is NOT one of the four conditions?"
        ),
        "option_a": "Mutual Exclusion",
        "option_b": "Preemption",
        "option_c": "Hold and Wait",
        "option_d": "Circular Wait",
        "correct_answer": 1,
        "explanation": (
            "The four Coffman conditions are: Mutual Exclusion, Hold and Wait, "
            "No Preemption, and Circular Wait. 'Preemption' being present would "
            "break deadlock; its absence (No Preemption) is the condition."
        ),
        "topic": "Operating Systems",
        "difficulty": "medium",
    },

    # ── COMPUTER NETWORKS ────────────────────────────────────────────────────
    {
        "question_text": (
            "Which AWS service provides scalable object storage suited for "
            "storing static files, backups, and data lakes?"
        ),
        "option_a": "Amazon EC2",
        "option_b": "Amazon S3",
        "option_c": "Amazon RDS",
        "option_d": "Amazon VPC",
        "correct_answer": 1,
        "explanation": (
            "Amazon S3 (Simple Storage Service) is AWS's object storage service, "
            "designed for scalability, durability (11 9s), and storing any amount "
            "of unstructured data."
        ),
        "topic": "Computer Networks",
        "difficulty": "easy",
    },
    {
        "question_text": (
            "In TCP's three-way handshake, what is the correct sequence of messages "
            "between client and server to establish a connection?"
        ),
        "option_a": "SYN → ACK → SYN-ACK",
        "option_b": "SYN → SYN-ACK → ACK",
        "option_c": "ACK → SYN → SYN-ACK",
        "option_d": "SYN-ACK → SYN → ACK",
        "correct_answer": 1,
        "explanation": (
            "The client sends SYN, the server responds with SYN-ACK, and finally "
            "the client sends ACK. This three-way handshake establishes a reliable "
            "TCP connection before data transfer begins."
        ),
        "topic": "Computer Networks",
        "difficulty": "easy",
    },
    {
        "question_text": (
            "Which layer of the OSI model is responsible for end-to-end error recovery "
            "and flow control between two hosts?"
        ),
        "option_a": "Network Layer (Layer 3)",
        "option_b": "Data Link Layer (Layer 2)",
        "option_c": "Transport Layer (Layer 4)",
        "option_d": "Session Layer (Layer 5)",
        "correct_answer": 2,
        "explanation": (
            "The Transport Layer (Layer 4) provides end-to-end communication, "
            "error recovery, and flow control. TCP and UDP operate at this layer."
        ),
        "topic": "Computer Networks",
        "difficulty": "easy",
    },
    {
        "question_text": (
            "A subnet mask of /26 is applied to an IPv4 address block. How many "
            "usable host addresses are available in each subnet?"
        ),
        "option_a": "30",
        "option_b": "62",
        "option_c": "126",
        "option_d": "254",
        "correct_answer": 1,
        "explanation": (
            "/26 means 26 bits for network, 6 bits for host → 2⁶=64 addresses. "
            "Subtracting 2 (network + broadcast) gives 62 usable host addresses."
        ),
        "topic": "Computer Networks",
        "difficulty": "medium",
    },

    # ── DBMS ──────────────────────────────────────────────────────────────────
    {
        "question_text": (
            "Which normal form eliminates partial dependencies of non-key attributes "
            "on a composite primary key?"
        ),
        "option_a": "First Normal Form (1NF)",
        "option_b": "Second Normal Form (2NF)",
        "option_c": "Third Normal Form (3NF)",
        "option_d": "Boyce-Codd Normal Form (BCNF)",
        "correct_answer": 1,
        "explanation": (
            "2NF requires that every non-key attribute is fully functionally dependent "
            "on the entire primary key, eliminating partial dependencies."
        ),
        "topic": "DBMS",
        "difficulty": "medium",
    },
    {
        "question_text": (
            "In a relational database, the ACID property that ensures uncommitted "
            "transactions leave no permanent effect on the database in case of failure is:"
        ),
        "option_a": "Atomicity",
        "option_b": "Consistency",
        "option_c": "Isolation",
        "option_d": "Durability",
        "correct_answer": 0,
        "explanation": (
            "Atomicity guarantees that a transaction is treated as a single unit: "
            "either all operations commit or none do. On failure, any partial changes "
            "are rolled back."
        ),
        "topic": "DBMS",
        "difficulty": "easy",
    },
    {
        "question_text": (
            "Which SQL clause is used to filter groups after aggregation, "
            "as opposed to filtering individual rows before aggregation?"
        ),
        "option_a": "WHERE",
        "option_b": "GROUP BY",
        "option_c": "HAVING",
        "option_d": "ORDER BY",
        "correct_answer": 2,
        "explanation": (
            "HAVING filters the results of GROUP BY aggregations. WHERE filters "
            "individual rows before any grouping occurs."
        ),
        "topic": "DBMS",
        "difficulty": "easy",
    },

    # ── COMPUTER ORGANIZATION ─────────────────────────────────────────────────
    {
        "question_text": (
            "In a direct-mapped cache with 256 blocks and a main memory of 64K blocks, "
            "how many bits are required for the tag field?"
        ),
        "option_a": "6",
        "option_b": "8",
        "option_c": "8",
        "option_d": "10",
        "correct_answer": 1,
        "explanation": (
            "Cache index bits = log₂(256) = 8. Main memory address bits = log₂(64K) = 16. "
            "Tag = 16 - 8 = 8 bits."
        ),
        "topic": "Computer Organization",
        "difficulty": "hard",
    },
    {
        "question_text": (
            "In a pipelined processor, a data hazard arises when:"
        ),
        "option_a": "Two instructions access different memory locations",
        "option_b": "An instruction depends on the result of a previous instruction not yet completed",
        "option_c": "A branch target is known at decode stage",
        "option_d": "The instruction cache is full",
        "correct_answer": 1,
        "explanation": (
            "A data hazard (RAW — Read After Write) occurs when an instruction needs "
            "a result that a prior instruction has not yet written back, causing pipeline stalls."
        ),
        "topic": "Computer Organization",
        "difficulty": "medium",
    },
    {
        "question_text": (
            "Two's complement representation of −7 in 4-bit binary is:"
        ),
        "option_a": "0111",
        "option_b": "1001",
        "option_c": "1110",
        "option_d": "1111",
        "correct_answer": 1,
        "explanation": (
            "7 in 4-bit binary is 0111. Inverting gives 1000; adding 1 gives 1001. "
            "So −7 in 4-bit two's complement is 1001."
        ),
        "topic": "Computer Organization",
        "difficulty": "medium",
    },

    # ── DIGITAL LOGIC ─────────────────────────────────────────────────────────
    {
        "question_text": (
            "The Boolean expression A·(A + B) simplifies to:"
        ),
        "option_a": "A + B",
        "option_b": "A·B",
        "option_c": "A",
        "option_d": "B",
        "correct_answer": 2,
        "explanation": (
            "By the Absorption Law: A·(A + B) = A·A + A·B = A + A·B = A(1 + B) = A."
        ),
        "topic": "Digital Logic",
        "difficulty": "easy",
    },
    {
        "question_text": (
            "A D flip-flop captures the value of D on the rising edge of the clock. "
            "If D=1 and the clock transitions from 0 to 1, what is Q after the transition?"
        ),
        "option_a": "0",
        "option_b": "1",
        "option_c": "Previous Q",
        "option_d": "Undefined",
        "correct_answer": 1,
        "explanation": (
            "A D flip-flop copies D to Q on the active (rising) clock edge. "
            "With D=1 at the rising edge, Q becomes 1."
        ),
        "topic": "Digital Logic",
        "difficulty": "easy",
    },

    # ── THEORY OF COMPUTATION ─────────────────────────────────────────────────
    {
        "question_text": (
            "Which of the following languages is NOT regular?"
        ),
        "option_a": "L = {w ∈ {a,b}* | w ends with 'ab'}",
        "option_b": "L = {aⁿbⁿ | n ≥ 0}",
        "option_c": "L = {w ∈ {0,1}* | w has even length}",
        "option_d": "L = {(ab)ⁿ | n ≥ 0}",
        "correct_answer": 1,
        "explanation": (
            "L={aⁿbⁿ} requires counting and matching n, which a finite automaton cannot do. "
            "By the Pumping Lemma, this language is not regular."
        ),
        "topic": "Theory of Computation",
        "difficulty": "medium",
    },
    {
        "question_text": (
            "A Non-deterministic Finite Automaton (NFA) with n states can be converted "
            "to an equivalent Deterministic Finite Automaton (DFA) with at most how many states?"
        ),
        "option_a": "n",
        "option_b": "n²",
        "option_c": "2ⁿ",
        "option_d": "n!",
        "correct_answer": 2,
        "explanation": (
            "The subset construction converts an NFA with n states to a DFA whose states "
            "are subsets of NFA states, giving at most 2ⁿ states."
        ),
        "topic": "Theory of Computation",
        "difficulty": "medium",
    },
    {
        "question_text": (
            "The Halting Problem is an example of a language that is:"
        ),
        "option_a": "Regular",
        "option_b": "Context-Free",
        "option_c": "Recursively Enumerable but not Recursive",
        "option_d": "Not even Recursively Enumerable",
        "correct_answer": 2,
        "explanation": (
            "The Halting Problem is Turing-recognizable (recursively enumerable) "
            "but not decidable (not recursive), as proven by Turing's diagonalization argument."
        ),
        "topic": "Theory of Computation",
        "difficulty": "hard",
    },

    # ── COMPILER DESIGN ───────────────────────────────────────────────────────
    {
        "question_text": (
            "In a compiler, which phase is responsible for breaking the source code "
            "into tokens such as keywords, identifiers, and literals?"
        ),
        "option_a": "Syntax Analysis (Parser)",
        "option_b": "Semantic Analysis",
        "option_c": "Lexical Analysis (Scanner)",
        "option_d": "Code Generation",
        "correct_answer": 2,
        "explanation": (
            "The Lexical Analyser (Scanner) reads source characters and groups them "
            "into tokens using regular expressions and finite automata."
        ),
        "topic": "Compiler Design",
        "difficulty": "easy",
    },
    {
        "question_text": (
            "Left recursion in a grammar (e.g., A → Aα | β) causes which parsing strategy to fail?"
        ),
        "option_a": "Bottom-Up (LR) Parsing",
        "option_b": "Top-Down (LL) Parsing",
        "option_c": "Earley Parsing",
        "option_d": "CYK Parsing",
        "correct_answer": 1,
        "explanation": (
            "Top-Down (LL) parsers expand the leftmost non-terminal; left recursion causes "
            "infinite expansion. LR (bottom-up) parsers handle left recursion correctly."
        ),
        "topic": "Compiler Design",
        "difficulty": "medium",
    },

    # ── DISCRETE MATHEMATICS ──────────────────────────────────────────────────
    {
        "question_text": (
            "How many distinct relations are possible on a set with 3 elements?"
        ),
        "option_a": "9",
        "option_b": "27",
        "option_c": "512",
        "option_d": "6",
        "correct_answer": 2,
        "explanation": (
            "A relation on a set A with |A|=n is a subset of A×A which has n² pairs. "
            "The number of subsets is 2^(n²). For n=3: 2^9 = 512."
        ),
        "topic": "Discrete Mathematics",
        "difficulty": "hard",
    },
    {
        "question_text": (
            "By the pigeonhole principle, if 13 socks are drawn from a drawer containing "
            "socks of 4 different colors, what is the minimum number guaranteed to be the same color?"
        ),
        "option_a": "3",
        "option_b": "4",
        "option_c": "13",
        "option_d": "5",
        "correct_answer": 1,
        "explanation": (
            "By the pigeonhole principle, with 13 socks and 4 colors, at least ⌈13/4⌉ = 4 "
            "socks must share the same color. Wait — ⌈13/4⌉=4. Correct answer is 4."
        ),
        "topic": "Discrete Mathematics",
        "difficulty": "medium",
    },
]
