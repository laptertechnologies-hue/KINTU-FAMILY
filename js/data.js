// KINTU FAMILY LINEAGE & HERITAGE PORTAL
// Master Seed Data Store

const KINTU_INITIAL_DATA = {
  familyInfo: {
    title: "The Kintu Family Heritage & Lineage",
    lugandaTitle: "Omulyango gw'Obukomera bwa Kintu",
    motto: "Rooted in Honor, United Across Generations",
    lugandaMotto: "Empisa n'Obumu: Amannya g'Ekika Tegafe",
    originHomeland: "Katende & Mpigi, Buganda Kingdom, Uganda",
    foundingYear: 1898,
    clanName: "Lugave (Pangolin) Clan / Omuziro gw'Olugave",
    totem: "Olugave (Pangolin)",
    secondaryTotem: "Akanfuka",
    clanGreeting: "Gyebale ko, Baana ba Kintu!",
    familyPin: "KINTU2026",
    elderWelcome: "A sacred gathering place for all sons, daughters, spouses, and descendants of the Kintu lineage. Whether you are walking the soil of Uganda or thriving across the global diaspora, this portal honors our ancestors and unites our future."
  },

  originStory: {
    summary: "The Kintu family legacy traces its roots back to the late 19th century in the rolling green hills of Katende, Mpigi district. Guided by steadfast faith, devotion to agriculture, and community leadership, our founding forebears cultivated not only fertile land but a culture of education, dignity, and unity that continues to inspire our descendants across five continents.",
    foundingPillars: [
      {
        title: "Obumu (Unity)",
        desc: "No branch falls from the tree that remains connected to its roots. We support each other across oceans and generations."
      },
      {
        title: "Obuntubulamu (Integrity & Honor)",
        desc: "Character and virtue are our greatest inheritance. We carry the Kintu name with modesty, respect, and dignity."
      },
      {
        title: "Okusoma n'Okukula (Wisdom & Growth)",
        desc: "From early clan schools to global institutions, our elders prioritized knowledge, entrepreneurship, and lifelong learning."
      },
      {
        title: "Okujjukira Abaatusooka (Ancestral Honor)",
        desc: "We remember and celebrate those who came before us, keeping their stories and sacrifices alive for our youth."
      }
    ]
  },

  timeline: [
    {
      year: "1898",
      title: "Establishment of the Katende Ancestral Seat",
      category: "Founding",
      description: "Patriarch Kintu Ssemakula establishes the family homestead in Katende, cultivating coffee, bananas, and building a sanctuary of community gathering."
    },
    {
      year: "1932",
      title: "The Great Community School Initiative",
      category: "Education",
      description: "Paulo Kintu Ssemakula and his contemporaries donate land and resources to build Katende Primary School, educating over three generations of local youth."
    },
    {
      year: "1962",
      title: "Independence & Academic Renaissance",
      category: "Milestone",
      description: "As Uganda gains independence, second-generation sons and daughters graduate with honors from Makerere University, venturing into engineering, medicine, and public service."
    },
    {
      year: "1984",
      title: "First Branches in the Global Diaspora",
      category: "Diaspora",
      description: "Family members expand beyond borders, establishing vibrant communities in London (UK), Boston (USA), and Nairobi (Kenya) while maintaining deep ties to the homeland."
    },
    {
      year: "2012",
      title: "The Grand Centenary Reunion in Kampala",
      category: "Celebration",
      description: "More than 180 descendants from 8 countries gather in Kampala for a week-long celebration of lineage, storytelling, and cultural revival."
    },
    {
      year: "2026",
      title: "Launch of the Digital Family Portal & Living Tree",
      category: "Innovation",
      description: "The next generation builds this permanent, interactive digital archive to ensure every newborn and diaspora descendant can discover and contribute to their tree."
    }
  ],

  members: [
    // Generation 1: Founders / Ancestors
    {
      id: "member-1",
      firstName: "Paulo",
      lastName: "Kintu Ssemakula",
      traditionalName: "Ssemakula",
      gender: "male",
      generation: 1,
      birthYear: 1912,
      deathYear: 1988,
      isDeceased: true,
      branch: "Founding Seat (Katende)",
      location: "Katende, Mpigi, Uganda",
      country: "Uganda",
      occupation: "Landowner, Agriculturalist & Elder",
      bio: "The foundational patriarch of the modern Kintu family. Renowned for his wisdom, benevolence, and commitment to rural education. Husband to Mama Joyce.",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      parentIds: [],
      spouseIds: ["member-2"],
      childrenIds: ["member-3", "member-5", "member-7", "member-9"]
    },
    {
      id: "member-2",
      firstName: "Joyce",
      lastName: "Namatovu Kintu",
      traditionalName: "Namatovu",
      gender: "female",
      generation: 1,
      birthYear: 1918,
      deathYear: 1996,
      isDeceased: true,
      branch: "Founding Seat (Katende)",
      location: "Katende, Mpigi, Uganda",
      country: "Uganda",
      occupation: "Matriarch, Healer & Community Pillar",
      bio: "Beloved mother whose warmth, traditional herbal wisdom, and prayerful guidance held the growing family steadfast through Uganda's formative decades.",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
      parentIds: [],
      spouseIds: ["member-1"],
      childrenIds: ["member-3", "member-5", "member-7", "member-9"]
    },

    // Generation 2: Eldest Children & Spouses
    {
      id: "member-3",
      firstName: "Eng. David",
      lastName: "Kintu Mukasa",
      traditionalName: "Mukasa",
      gender: "male",
      generation: 2,
      birthYear: 1944,
      deathYear: null,
      isDeceased: false,
      branch: "Mukasa Branch (Kampala)",
      location: "Kampala, Uganda",
      country: "Uganda",
      occupation: "Civil Engineer & Family Council Chair",
      bio: "Senior engineer who oversaw major national infrastructure projects. Current custodian of family historical records and land trusts.",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
      parentIds: ["member-1", "member-2"],
      spouseIds: ["member-4"],
      childrenIds: ["member-11", "member-12", "member-13"]
    },
    {
      id: "member-4",
      firstName: "Sarah",
      lastName: "Nabulya Kintu",
      traditionalName: "Nabulya",
      gender: "female",
      generation: 2,
      birthYear: 1948,
      deathYear: null,
      isDeceased: false,
      branch: "Mukasa Branch (Kampala)",
      location: "Kampala, Uganda",
      country: "Uganda",
      occupation: "Retired Educator & Nutritionist",
      bio: "Inspiring teacher who dedicated 35 years to secondary school education in Kampala. Passionate about preserving clan proverbs.",
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      parentIds: [],
      spouseIds: ["member-3"],
      childrenIds: ["member-11", "member-12", "member-13"]
    },
    {
      id: "member-5",
      firstName: "Dr. Grace",
      lastName: "Kintu Nakazibwe",
      traditionalName: "Nakazibwe",
      gender: "female",
      generation: 2,
      birthYear: 1947,
      deathYear: null,
      isDeceased: false,
      branch: "UK Branch (London)",
      location: "London, United Kingdom",
      country: "United Kingdom",
      occupation: "Consultant Physician & Philanthropist",
      bio: "Trailblazer medical doctor in London who founded medical bursaries for young Ugandan students. Mother of Edward and Evelyn.",
      photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
      parentIds: ["member-1", "member-2"],
      spouseIds: ["member-6"],
      childrenIds: ["member-14", "member-15"]
    },
    {
      id: "member-6",
      firstName: "Robert",
      lastName: "Thorne",
      traditionalName: "",
      gender: "male",
      generation: 2,
      birthYear: 1945,
      deathYear: 2021,
      isDeceased: true,
      branch: "UK Branch (London)",
      location: "London, United Kingdom",
      country: "United Kingdom",
      occupation: "Architect & Urban Historian",
      bio: "Esteemed architect and beloved spouse of Dr. Grace. Known for his deep appreciation of East African architecture and warmth.",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      parentIds: [],
      spouseIds: ["member-5"],
      childrenIds: ["member-14", "member-15"]
    },
    {
      id: "member-7",
      firstName: "Hon. Joseph",
      lastName: "Kintu Ssebunya",
      traditionalName: "Ssebunya",
      gender: "male",
      generation: 2,
      birthYear: 1952,
      deathYear: null,
      isDeceased: false,
      branch: "Ssebunya Branch (Entebbe)",
      location: "Entebbe, Uganda",
      country: "Uganda",
      occupation: "Diplomat & Agricultural Developer",
      bio: "Former foreign envoy and passionate advocate for sustainable aquaculture around Lake Victoria. Father of Brian, Christine, and Arthur.",
      photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
      parentIds: ["member-1", "member-2"],
      spouseIds: ["member-8"],
      childrenIds: ["member-16", "member-17", "member-18"]
    },
    {
      id: "member-8",
      firstName: "Florence",
      lastName: "Babirye Kintu",
      traditionalName: "Babirye",
      gender: "female",
      generation: 2,
      birthYear: 1956,
      deathYear: null,
      isDeceased: false,
      branch: "Ssebunya Branch (Entebbe)",
      location: "Entebbe, Uganda",
      country: "Uganda",
      occupation: "Horticulturist & Entrepreneur",
      bio: "Pioneer in organic flower export and community cooperative leader. Champions women empowerment across Wakiso district.",
      photo: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80",
      parentIds: [],
      spouseIds: ["member-7"],
      childrenIds: ["member-16", "member-17", "member-18"]
    },
    {
      id: "member-9",
      firstName: "Miriam",
      lastName: "Kintu Namaganda",
      traditionalName: "Namaganda",
      gender: "female",
      generation: 2,
      birthYear: 1958,
      deathYear: null,
      isDeceased: false,
      branch: "US Branch (Boston)",
      location: "Boston, MA, USA",
      country: "United States",
      occupation: "Professor of Public Health",
      bio: "Faculty member in Boston researching maternal health outcomes globally. Coordinator of North American Kintu diaspora chapters.",
      photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80",
      parentIds: ["member-1", "member-2"],
      spouseIds: ["member-10"],
      childrenIds: ["member-19", "member-20"]
    },
    {
      id: "member-10",
      firstName: "Dr. Emmanuel",
      lastName: "Musisi",
      traditionalName: "Musisi",
      gender: "male",
      generation: 2,
      birthYear: 1955,
      deathYear: null,
      isDeceased: false,
      branch: "US Branch (Boston)",
      location: "Boston, MA, USA",
      country: "United States",
      occupation: "Biomedical Scientist",
      bio: "Respected researcher and husband to Miriam. Always eager to mentor aspiring scientists in the family.",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      parentIds: [],
      spouseIds: ["member-9"],
      childrenIds: ["member-19", "member-20"]
    },

    // Generation 3: Grandchildren
    {
      id: "member-11",
      firstName: "Ronald",
      lastName: "Kintu Mukasa",
      traditionalName: "Mukasa",
      gender: "male",
      generation: 3,
      birthYear: 1976,
      deathYear: null,
      isDeceased: false,
      branch: "Mukasa Branch (Kampala)",
      location: "Kampala, Uganda",
      country: "Uganda",
      occupation: "Software Architect & Tech Founder",
      bio: "Tech entrepreneur passionate about digital innovation in Africa. Proud father of Trevor and Maya.",
      photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
      parentIds: ["member-3", "member-4"],
      spouseIds: [],
      childrenIds: ["member-21", "member-22"]
    },
    {
      id: "member-12",
      firstName: "Dr. Brenda",
      lastName: "Kintu Nabakooza",
      traditionalName: "Nabakooza",
      gender: "female",
      generation: 3,
      birthYear: 1980,
      deathYear: null,
      isDeceased: false,
      branch: "Mukasa Branch (Nairobi)",
      location: "Nairobi, Kenya",
      country: "Kenya",
      occupation: "Pediatric Cardiologist",
      bio: "Specialist doctor at Aga Khan University Hospital, Nairobi. Committed to children's heart health.",
      photo: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&auto=format&fit=crop&q=80",
      parentIds: ["member-3", "member-4"],
      spouseIds: [],
      childrenIds: ["member-23"]
    },
    {
      id: "member-13",
      firstName: "Dennis",
      lastName: "Kintu Ssemakula",
      traditionalName: "Ssemakula",
      gender: "male",
      generation: 3,
      birthYear: 1984,
      deathYear: null,
      isDeceased: false,
      branch: "Mukasa Branch (Canada)",
      location: "Toronto, Canada",
      country: "Canada",
      occupation: "Renewable Energy Specialist",
      bio: "Leading solar and grid infrastructure projects across Eastern Canada. Devoted father of Noah and Chloe.",
      photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
      parentIds: ["member-3", "member-4"],
      spouseIds: [],
      childrenIds: ["member-24", "member-25"]
    },
    {
      id: "member-14",
      firstName: "Edward",
      lastName: "Thorne-Kintu",
      traditionalName: "Kintu",
      gender: "male",
      generation: 3,
      birthYear: 1978,
      deathYear: null,
      isDeceased: false,
      branch: "UK Branch (London)",
      location: "Oxford, United Kingdom",
      country: "United Kingdom",
      occupation: "Fintech Executive & Angel Investor",
      bio: "Invests in high-growth African startups and oversees financial sustainability projects for family initiatives.",
      photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
      parentIds: ["member-5", "member-6"],
      spouseIds: [],
      childrenIds: []
    },
    {
      id: "member-15",
      firstName: "Evelyn",
      lastName: "Thorne-Kintu",
      traditionalName: "Nambi",
      gender: "female",
      generation: 3,
      birthYear: 1982,
      deathYear: null,
      isDeceased: false,
      branch: "UK Branch (London)",
      location: "London, United Kingdom",
      country: "United Kingdom",
      occupation: "International Human Rights Barrister",
      bio: "Advocating for migrant rights and legal equality before European and Commonwealth courts.",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      parentIds: ["member-5", "member-6"],
      spouseIds: [],
      childrenIds: []
    },
    {
      id: "member-16",
      firstName: "Brian",
      lastName: "Kintu Wasswa",
      traditionalName: "Wasswa",
      gender: "male",
      generation: 3,
      birthYear: 1986,
      deathYear: null,
      isDeceased: false,
      branch: "Ssebunya Branch (Entebbe)",
      location: "Entebbe, Uganda",
      country: "Uganda",
      occupation: "Modern Agronomist & Farm Director",
      bio: "Manager of the revitalized Katende family estate, introducing hydroponics and value-addition agro-processing.",
      photo: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80",
      parentIds: ["member-7", "member-8"],
      spouseIds: [],
      childrenIds: []
    },
    {
      id: "member-17",
      firstName: "Christine",
      lastName: "Kintu Nakato",
      traditionalName: "Nakato",
      gender: "female",
      generation: 3,
      birthYear: 1986,
      deathYear: null,
      isDeceased: false,
      branch: "Ssebunya Branch (Entebbe)",
      location: "Kampala, Uganda",
      country: "Uganda",
      occupation: "Sustainable Architect & Interior Designer",
      bio: "Twin sister to Brian. Designs eco-friendly residences combining contemporary lines with authentic African clay and timber.",
      photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80",
      parentIds: ["member-7", "member-8"],
      spouseIds: [],
      childrenIds: []
    },
    {
      id: "member-18",
      firstName: "Arthur",
      lastName: "Kintu Ssebunya",
      traditionalName: "Ssebunya",
      gender: "male",
      generation: 3,
      birthYear: 1992,
      deathYear: null,
      isDeceased: false,
      branch: "Ssebunya Branch (Entebbe)",
      location: "Kampala, Uganda",
      country: "Uganda",
      occupation: "Filmmaker & Creative Director",
      bio: "Documenting Uganda's rich cultural histories, folk music, and visual storytelling. Lead archivist for our family site.",
      photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
      parentIds: ["member-7", "member-8"],
      spouseIds: [],
      childrenIds: []
    },
    {
      id: "member-19",
      firstName: "Kevin",
      lastName: "Musisi-Kintu",
      traditionalName: "Kintu",
      gender: "male",
      generation: 3,
      birthYear: 1988,
      deathYear: null,
      isDeceased: false,
      branch: "US Branch (Boston)",
      location: "New York, NY, USA",
      country: "United States",
      occupation: "AI Research Scientist",
      bio: "Specializes in natural language processing and African language preservation models. Mentors youth in machine learning.",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      parentIds: ["member-9", "member-10"],
      spouseIds: [],
      childrenIds: []
    },
    {
      id: "member-20",
      firstName: "Vanessa",
      lastName: "Musisi-Kintu",
      traditionalName: "Namaganda",
      gender: "female",
      generation: 3,
      birthYear: 1993,
      deathYear: null,
      isDeceased: false,
      branch: "US Branch (Boston)",
      location: "Chicago, IL, USA",
      country: "United States",
      occupation: "Environmental Policy Advisor",
      bio: "Advises international bodies on clean water accessibility and climate resilience in East Africa.",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
      parentIds: ["member-9", "member-10"],
      spouseIds: [],
      childrenIds: []
    },

    // Generation 4: Great-Grandchildren / Youth
    {
      id: "member-21",
      firstName: "Trevor",
      lastName: "Kintu Mukasa",
      traditionalName: "Mukasa",
      gender: "male",
      generation: 4,
      birthYear: 2004,
      deathYear: null,
      isDeceased: false,
      branch: "Mukasa Branch (Kampala)",
      location: "Kampala, Uganda",
      country: "Uganda",
      occupation: "Computer Science Scholar (Makerere)",
      bio: "Avid roboticist, competitive chess player, and co-developer of youth community initiatives.",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      parentIds: ["member-11"],
      spouseIds: [],
      childrenIds: []
    },
    {
      id: "member-22",
      firstName: "Maya",
      lastName: "Kintu Namatovu",
      traditionalName: "Namatovu",
      gender: "female",
      generation: 4,
      birthYear: 2008,
      deathYear: null,
      isDeceased: false,
      branch: "Mukasa Branch (Kampala)",
      location: "Kampala, Uganda",
      country: "Uganda",
      occupation: "Student & Emerging Pianist",
      bio: "Talented classical and African gospel pianist with a passion for creative writing and debate.",
      photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
      parentIds: ["member-11"],
      spouseIds: [],
      childrenIds: []
    },
    {
      id: "member-23",
      firstName: "Ethan",
      lastName: "Kintu Ochieng",
      traditionalName: "Kintu",
      gender: "male",
      generation: 4,
      birthYear: 2011,
      deathYear: null,
      isDeceased: false,
      branch: "Mukasa Branch (Nairobi)",
      location: "Nairobi, Kenya",
      country: "Kenya",
      occupation: "Middle School Scholar & Swimmer",
      bio: "Junior national swimmer and junior science fair medalist.",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
      parentIds: ["member-12"],
      spouseIds: [],
      childrenIds: []
    },
    {
      id: "member-24",
      firstName: "Noah",
      lastName: "Kintu Ssemakula",
      traditionalName: "Ssemakula",
      gender: "male",
      generation: 4,
      birthYear: 2015,
      deathYear: null,
      isDeceased: false,
      branch: "Mukasa Branch (Canada)",
      location: "Toronto, Canada",
      country: "Canada",
      occupation: "Elementary Student & Ice Hockey Enthusiast",
      bio: "Loves science experiments, soccer, and visiting grandfather's farm in Katende during summer.",
      photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
      parentIds: ["member-13"],
      spouseIds: [],
      childrenIds: []
    },
    {
      id: "member-25",
      firstName: "Chloe",
      lastName: "Kintu Nambi",
      traditionalName: "Nambi",
      gender: "female",
      generation: 4,
      birthYear: 2019,
      deathYear: null,
      isDeceased: false,
      branch: "Mukasa Branch (Canada)",
      location: "Toronto, Canada",
      country: "Canada",
      occupation: "Kindergarten Explorer",
      bio: "The youngest joy of the Toronto branch. Loves drawing and singing traditional Luganda nursery rhymes.",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
      parentIds: ["member-13"],
      spouseIds: [],
      childrenIds: []
    }
  ],

  memorialTributes: [
    {
      name: "Mzee Paulo Kintu Ssemakula",
      years: "1912 – 1988",
      role: "Founding Patriarch & Educator",
      quote: "Omuti omuto gwe gukula okufuuka ekibira: Treat every child as the bearer of the family's crown.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      legacy: "Established our ancestral seat in Katende, donated land for the Katende Community School, and instilled in all four branches the virtue of unshakeable humility."
    },
    {
      name: "Mama Joyce Namatovu Kintu",
      years: "1918 – 1996",
      role: "Matriarch & Healer",
      quote: "Ebyafaayo tebibula: A family that honours its mothers will never lose its direction in the storm.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
      legacy: "Known as the spiritual heart of the family. Nurtured over fifty children, nieces, and nephews with grace, herbal remedies, and endless warmth."
    },
    {
      name: "Robert Thorne",
      years: "1945 – 2021",
      role: "Architect & Cherished In-Law",
      quote: "Build structures that outlive you, but build relationships that defy distance.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      legacy: "United our Ugandan and British branches with humor, kindness, and architectural drawings that celebrated African vernacular design."
    }
  ],

  gallery: [
    {
      id: "img-1",
      title: "Mzee Paulo & Mama Joyce in Katende (1968)",
      category: "Ancestral",
      year: "1968",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
      caption: "A rare candid portrait outside the original brick homestead in Katende, Mpigi."
    },
    {
      id: "img-2",
      title: "The Centenary Family Gathering in Kampala",
      category: "Reunions",
      year: "2012",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80",
      caption: "Four generations gathered under the royal marquee at the Kampala Serena Hotel."
    },
    {
      id: "img-3",
      title: "Traditional Introduction & Wedding Ceremony (Kwanjula)",
      category: "Celebrations",
      year: "2018",
      image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80",
      caption: "Celebrating cultural heritage and joyful unions adorned in gomesi and kanzu."
    },
    {
      id: "img-4",
      title: "Ancestral Grounds & Banana Groves in Katende",
      category: "Homeland",
      year: "2024",
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80",
      caption: "The preserved green sanctuary where the Kintu family legacy began."
    },
    {
      id: "img-5",
      title: "Youth Tech & Innovation Mentorship",
      category: "Future",
      year: "2025",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
      caption: "Ronald and Kevin mentoring the younger Kintu cousins in programming and entrepreneurship."
    }
  ],

  upcomingReunion: {
    title: "Kintu Global Family Reunion 2026",
    theme: "Awamu: Honoring Our Roots, Charting Our Tomorrow",
    date: "December 18 – 21, 2026",
    location: "Kampala & Katende Homestead, Uganda",
    rsvpTarget: 250,
    confirmedRsvp: 142,
    schedule: [
      { day: "Day 1 (Dec 18)", event: "Arrival, Registration & Welcome Cocktail (Kampala)" },
      { day: "Day 2 (Dec 19)", event: "Pilgrimage to Ancestral Grounds, Clan Blessings & Feast (Katende)" },
      { day: "Day 3 (Dec 20)", event: "Youth Symposium, Career Mentorship & Grand Banquet" },
      { day: "Day 4 (Dec 21)", event: "Farewell Thanksgiving Service & Family Photo Session" }
    ]
  },

  diasporaStats: [
    { country: "Uganda", count: 28, flag: "🇺🇬", cities: "Kampala, Entebbe, Mpigi, Jinja" },
    { country: "United Kingdom", count: 12, flag: "🇬🇧", cities: "London, Oxford, Birmingham" },
    { country: "United States", count: 15, flag: "🇺🇸", cities: "Boston, New York, Chicago, Atlanta" },
    { country: "Canada", count: 8, flag: "🇨🇦", cities: "Toronto, Ottawa, Vancouver" },
    { country: "Kenya", count: 5, flag: "🇰🇪", cities: "Nairobi, Mombasa" },
    { country: "Other Diaspora", count: 6, flag: "🌍", cities: "Sweden, South Africa, UAE" }
  ]
};

// Local storage management to allow dynamic updates
const STORAGE_KEY = "kintu_family_data_v1";
const CLOUD_CONFIG_KEY = "kintu_cloud_config_v1";

function getFamilyData() {
  const local = localStorage.getItem(STORAGE_KEY);
  if (!local) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(KINTU_INITIAL_DATA));
    return KINTU_INITIAL_DATA;
  }
  try {
    return JSON.parse(local);
  } catch (e) {
    console.error("Failed parsing localStorage family data", e);
    return KINTU_INITIAL_DATA;
  }
}

function saveFamilyData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // If cloud database is configured, sync asynchronously in background
  syncMemberToCloudIfEnabled(data);
}

function resetFamilyDataToDefault() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(KINTU_INITIAL_DATA));
  return KINTU_INITIAL_DATA;
}

// -------------------------------------------------------------
// CLOUD DATABASE INTEGRATION (Supabase / REST)
// -------------------------------------------------------------
function getCloudConfig() {
  const local = localStorage.getItem(CLOUD_CONFIG_KEY);
  return local ? JSON.parse(local) : { supabaseUrl: "", supabaseAnonKey: "", isConnected: false };
}

function saveCloudConfig(config) {
  localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
}

async function syncMemberToCloudIfEnabled(data) {
  const config = getCloudConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey || !config.isConnected) {
    return; // Using local persistent database
  }

  try {
    // Posts new members to Supabase 'family_members' table
    const latestMember = data.members[data.members.length - 1];
    if (!latestMember) return;

    const endpoint = `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/family_members`;
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: latestMember.id,
        first_name: latestMember.firstName,
        last_name: latestMember.lastName,
        traditional_name: latestMember.traditionalName,
        gender: latestMember.gender,
        generation: latestMember.generation,
        birth_year: latestMember.birthYear,
        branch: latestMember.branch,
        location: latestMember.location,
        country: latestMember.country,
        occupation: latestMember.occupation,
        bio: latestMember.bio,
        photo_url: latestMember.photo,
        parent_ids: latestMember.parentIds,
        spouse_ids: latestMember.spouseIds,
        children_ids: latestMember.childrenIds
      })
    });
    console.log("Synced member to cloud database successfully.");
  } catch (err) {
    console.warn("Cloud database sync notice:", err);
  }
}

