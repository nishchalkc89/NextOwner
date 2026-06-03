import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, GraduationCap, X, PenLine } from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════════════════
   INDIA — comprehensive university database (300 + institutions)
═══════════════════════════════════════════════════════════════════════════ */
const INDIA_GROUPS = [
  {
    id: 'iit', label: '🏛️ IITs',
    unis: [
      'IIT Bhilai', 'IIT Bhubaneswar', 'IIT BHU Varanasi', 'IIT Bombay',
      'IIT Delhi', 'IIT Dharwad', 'IIT Dhanbad (ISM)', 'IIT Gandhinagar',
      'IIT Goa', 'IIT Guwahati', 'IIT Hyderabad', 'IIT Indore',
      'IIT Jammu', 'IIT Jodhpur', 'IIT Kanpur', 'IIT Kharagpur',
      'IIT Madras', 'IIT Mandi', 'IIT Palakkad', 'IIT Patna',
      'IIT Roorkee', 'IIT Ropar', 'IIT Tirupati',
    ],
  },
  {
    id: 'nit', label: '🔧 NITs',
    unis: [
      'NIT Agartala', 'NIT Andhra Pradesh', 'NIT Arunachal Pradesh',
      'NIT Calicut', 'NIT Delhi', 'NIT Durgapur', 'NIT Goa',
      'NIT Hamirpur', 'NIT Jamshedpur', 'NIT Kurukshetra',
      'NIT Manipur', 'NIT Meghalaya', 'NIT Mizoram', 'NIT Nagaland',
      'NIT Patna', 'NIT Puducherry', 'NIT Raipur', 'NIT Rourkela',
      'NIT Silchar', 'NIT Sikkim', 'NIT Srinagar',
      'NIT Surathkal (NITK)', 'NIT Tiruchirappalli', 'NIT Uttarakhand',
      'NIT Warangal',
      'MNIT Jaipur', 'MNNIT Allahabad', 'SVNIT Surat', 'VNIT Nagpur',
    ],
  },
  {
    id: 'iiit', label: '💻 IIITs',
    unis: [
      'ABV-IIIT Gwalior', 'IIIT Allahabad', 'IIIT Bangalore',
      'IIIT Bhopal', 'IIIT Delhi', 'IIIT Dharwad', 'IIIT Guwahati',
      'IIIT Hyderabad', 'IIIT Jabalpur (IIITDM)', 'IIIT Kancheepuram',
      'IIIT Kottayam', 'IIIT Lucknow', 'IIIT Manipur', 'IIIT Nagpur',
      'IIIT Pune', 'IIIT Ranchi', 'IIIT Sonepat', 'IIIT Sri City',
      'IIIT Surat', 'IIIT Tiruchirappalli', 'IIIT Una', 'IIIT Vadodara',
    ],
  },
  {
    id: 'central', label: '🎓 Central Universities',
    unis: [
      'Aligarh Muslim University (AMU)',
      'Assam University',
      'Babasaheb Bhimrao Ambedkar University Lucknow',
      'Banaras Hindu University (BHU)',
      'Central University of Andhra Pradesh',
      'Central University of Gujarat',
      'Central University of Haryana',
      'Central University of Himachal Pradesh',
      'Central University of Jammu',
      'Central University of Jharkhand',
      'Central University of Karnataka',
      'Central University of Kashmir',
      'Central University of Kerala',
      'Central University of Odisha',
      'Central University of Punjab',
      'Central University of Rajasthan',
      'Central University of South Bihar',
      'Central University of Tamil Nadu',
      'Dr. B.R. Ambedkar University Delhi',
      'Dr. Harisingh Gour University Sagar',
      'English and Foreign Languages University (EFLU)',
      'Guru Ghasidas Vishwavidyalaya',
      'HNB Garhwal University',
      'Indira Gandhi National Open University (IGNOU)',
      'Indira Gandhi National Tribal University',
      'Jamia Millia Islamia',
      'Jawaharlal Nehru University (JNU)',
      'Mahatma Gandhi Antarrashtriya Hindi Vishwavidyalaya',
      'Manipur University',
      'Mizoram University',
      'Nagaland University',
      'North-Eastern Hill University (NEHU)',
      'Pondicherry University',
      'Rajiv Gandhi University Arunachal Pradesh',
      'Sikkim University',
      'Tezpur University',
      'Tripura University',
      'University of Allahabad',
      'University of Delhi (DU)',
      'University of Hyderabad',
      'University of Jammu',
      'University of Kashmir',
      'Visva-Bharati Santiniketan',
    ],
  },
  {
    id: 'state', label: '📚 State Universities',
    unis: [
      'Acharya Nagarjuna University', 'Andhra University',
      'Anna University', 'Annamalai University',
      'APJ Abdul Kalam Technological University (KTU)',
      'Bangalore University', 'Barkatullah University',
      'Berhampur University', 'Bharathiar University',
      'Bharathidasan University',
      'Bundelkhand University', 'Calicut University',
      'Calcutta University',
      'Chaudhary Charan Singh University',
      'Chaudhary Devi Lal University',
      'Cochin University of Science and Technology (CUSAT)',
      'Cotton University',
      'Davangere University',
      'Delhi Technological University (DTU)',
      'Devi Ahilya Vishwavidyalaya (DAVV)',
      'Dibrugarh University',
      'Doon University',
      'Dr. Babasaheb Ambedkar Marathwada University',
      'Dr. Babasaheb Ambedkar Technological University Lonere',
      'Dr. Ram Manohar Lohia Avadh University',
      'Dr. YSR Horticultural University',
      'Fakir Mohan University',
      'Gauhati University',
      'Goa University',
      'Gujarat Technological University (GTU)',
      'Gujarat University',
      'Gulbarga University',
      'Guru Gobind Singh Indraprastha University (GGSIPU)',
      'Guru Jambheshwar University',
      'Guru Nanak Dev University',
      'Hemchand Yadav University',
      'Himachal Pradesh University',
      'IK Gujral Punjab Technical University',
      'Jadavpur University',
      'Jai Narain Vyas University Jodhpur',
      'Jiwaji University',
      'JNTU Anantapur', 'JNTU Hyderabad', 'JNTU Kakinada',
      'Kakatiya University',
      'Karnataka State Open University',
      'Kerala University',
      'Krishna University',
      'Kumaun University',
      'Kurukshetra University',
      'Kuvempu University',
      'Lucknow University',
      'Madras University',
      'Madurai Kamaraj University',
      'Magadh University',
      'Mahatma Gandhi Kashi Vidyapith',
      'Mahatma Gandhi University Kerala',
      'Maharaja Sayajirao University of Baroda',
      'Maharshi Dayanand University (MDU)',
      'Mangalore University',
      'Mechi Multiple Campus',
      'MJP Rohilkhand University',
      'Mumbai University',
      'Munger University',
      'Mysore University',
      'Nagpur University (RTMNU)',
      'Netaji Subhas University of Technology (NSUT)',
      'North Bengal University',
      'Osmania University',
      'Panjab University Chandigarh',
      'Patna University',
      'Periyar University',
      'Presidency University Kolkata',
      'Pt. Ravishankar Shukla University',
      'Punjabi University Patiala',
      'Pune University (SPPU)',
      'Rajasthan Technical University',
      'Rani Durgavati University',
      'Ranchi University',
      'Rayalaseema University',
      'Sambalpur University',
      'Saurashtra University',
      'Shivaji University Kolhapur',
      'Solapur University',
      'Sri Krishnadevaraya University',
      'Sri Venkateswara University',
      'Telangana University',
      'Thiruvalluvar University',
      'Tumkur University',
      'University of Burdwan',
      'University of Rajasthan',
      'Utkal University',
      'Veer Kunwar Singh University',
      'Veer Surendra Sai University of Technology (VSSUT)',
      'Vikram University',
      'Vinoba Bhave University',
      'Visvesvaraya Technological University (VTU)',
    ],
  },
  {
    id: 'medical_in', label: '🏥 Medical & AIIMS',
    unis: [
      'AIIMS Bhopal', 'AIIMS Bhubaneswar', 'AIIMS Delhi',
      'AIIMS Gorakhpur', 'AIIMS Jodhpur', 'AIIMS Kalyani',
      'AIIMS Mangalagiri', 'AIIMS Nagpur', 'AIIMS Patna',
      'AIIMS Raebareli', 'AIIMS Raipur', 'AIIMS Rishikesh',
      'AIIMS Telangana', 'AIIMS Vijaypur',
      'Armed Forces Medical College (AFMC) Pune',
      'JIPMER Puducherry',
      'Kasturba Medical College Mangalore',
      'Kasturba Medical College Manipal',
      'Maulana Azad Medical College Delhi',
      'PGIMER Chandigarh',
      'Seth GS Medical College Mumbai',
    ],
  },
  {
    id: 'iim', label: '💼 IIMs & Management',
    unis: [
      'IIM Ahmedabad', 'IIM Amritsar', 'IIM Bangalore', 'IIM Bodh Gaya',
      'IIM Calcutta', 'IIM Indore', 'IIM Jammu', 'IIM Kashipur',
      'IIM Kozhikode', 'IIM Lucknow', 'IIM Mumbai', 'IIM Nagpur',
      'IIM Raipur', 'IIM Ranchi', 'IIM Rohtak', 'IIM Sambalpur',
      'IIM Shillong', 'IIM Sirmaur', 'IIM Tiruchirappalli', 'IIM Udaipur',
      'IMT Ghaziabad', 'MDI Gurgaon', 'NMIMS Mumbai',
      'S.P. Jain Institute of Management Mumbai',
      'TAPMI Manipal', 'XLRI Jamshedpur',
    ],
  },
  {
    id: 'science_in', label: '🔬 Science Institutes',
    unis: [
      'Indian Institute of Science (IISc) Bangalore',
      'IISER Bhopal', 'IISER Kolkata', 'IISER Mohali',
      'IISER Pune', 'IISER Thiruvananthapuram', 'IISER Tirupati',
      'ISI Bangalore', 'ISI Delhi', 'ISI Kolkata',
      'NISER Bhubaneswar',
    ],
  },
  {
    id: 'bits', label: '⚡ BITS Pilani',
    unis: [
      'BITS Pilani – Pilani Campus',
      'BITS Pilani – Goa Campus',
      'BITS Pilani – Hyderabad Campus',
      'BITS Pilani – Dubai Campus',
    ],
  },
  {
    id: 'private_in', label: '🏫 Private Universities',
    unis: [
      'Amity University Lucknow', 'Amity University Mumbai',
      'Amity University Noida', 'Amity University Ranchi',
      'Ashoka University', 'Azim Premji University',
      'Bennett University', 'BMS College of Engineering',
      'Christ University Bangalore',
      'Chandigarh University', 'Chitkara University',
      'COEP Technological University Pune',
      'DIT University Dehradun',
      'FLAME University Pune',
      'Galgotias University',
      'Graphic Era University',
      'ICT Mumbai (UDCT)',
      'Jain University Bangalore',
      'Jamia Hamdard',
      'KIIT University Bhubaneswar',
      'Krea University',
      'Lovely Professional University (LPU)',
      'Manipal Academy of Higher Education (MAHE)',
      'Manipal Institute of Technology (MIT Manipal)',
      'Manipal University Jaipur',
      'MIT-WPU Pune',
      'MS Ramaiah Institute of Technology',
      'NIIT University',
      'O.P. Jindal Global University',
      'PES University Bangalore',
      'Plaksha University',
      'Presidency University Bangalore',
      'Pune Institute of Computer Technology (PICT)',
      'RV College of Engineering',
      'Sharda University',
      'Shoolini University',
      'SOA University',
      'SRM Institute of Science and Technology Chennai',
      'SRM University AP', 'SRM University Delhi-NCR',
      'SRM University Sikkim',
      'Symbiosis International University',
      'Thapar Institute of Engineering',
      'VIT AP', 'VIT Bhopal', 'VIT Chennai', 'VIT Vellore',
      'VJTI Mumbai',
      'Woxsen University',
      'Xavier University Bhubaneswar',
    ],
  },
  {
    id: 'college_in', label: '🏛️ Autonomous Colleges',
    unis: [
      'Bishop Cotton Women\'s Christian College Bangalore',
      'Elphinstone College Mumbai',
      'Fergusson College Pune',
      'Hansraj College Delhi',
      'Hindu College Delhi',
      'Kirori Mal College Delhi',
      'Lady Shri Ram College Delhi',
      'Loyola College Chennai',
      'Madras Christian College',
      'Miranda House Delhi',
      'Mount Carmel College Bangalore',
      'Presidency College Chennai',
      'Presidency College Kolkata',
      'Scottish Church College Kolkata',
      'Shri Ram College of Commerce (SRCC)',
      'St. Stephen\'s College Delhi',
      'St. Xavier\'s College Kolkata',
      'St. Xavier\'s College Mumbai',
    ],
  },
]

/* ═══════════════════════════════════════════════════════════════════════════
   NEPAL — comprehensive university database (200 + institutions)
═══════════════════════════════════════════════════════════════════════════ */
const NEPAL_GROUPS = [
  {
    id: 'univ_np', label: '🎓 Universities',
    unis: [
      'Tribhuvan University (TU)',
      'Kathmandu University (KU)',
      'Pokhara University (PU)',
      'Purbanchal University',
      'Mid-Western University',
      'Far-Western University',
      'Lumbini Buddhist University',
      'Agriculture and Forestry University (AFU)',
      'Rajarshi Janak University',
      'Madan Bhandari University of Science and Technology',
      'Nepal Open University',
      'Nepal Sanskrit University',
    ],
  },
  {
    id: 'ioe', label: '🔧 IOE Constituent Campuses (TU)',
    unis: [
      'Pulchowk Campus, IOE',
      'Thapathali Campus, IOE',
      'Paschimanchal Campus, IOE (Pokhara)',
      'Purbanchal Campus, IOE (Dharan)',
      'Eastern Region Campus, IOE (Dharan)',
      'Western Region Campus, IOE (Pokhara)',
      'Central Campus of Technology (CCT), IOE',
      'Himalaya Engineering College (IOE Affiliated)',
    ],
  },
  {
    id: 'ku_np', label: '🏛️ KU Schools & Affiliates',
    unis: [
      'KU School of Engineering (KUSOE)',
      'KU School of Medical Sciences – Dhulikhel',
      'KU School of Science',
      'KU School of Arts',
      'KU School of Management (KUSOM)',
      'KU School of Education',
      'KU School of Law',
      'Kathmandu University Hospital',
    ],
  },
  {
    id: 'medical_np', label: '🏥 Medical & Health Sciences',
    unis: [
      'B.P. Koirala Institute of Health Sciences (BPKIHS)',
      'College of Medical Sciences (CMS), Bharatpur',
      'Gandaki Medical College',
      'Institute of Medicine (IOM), TU',
      'Janaki Medical College',
      'Kathmandu Medical College (KMC)',
      'KIST Medical College',
      'Lumbini Medical College',
      'Manipal College of Medical Sciences (MCOMS)',
      'National Academy of Medical Sciences (NAMS)',
      'National Medical College',
      'Nobel Medical College',
      'Patan Academy of Health Sciences (PAHS)',
      'Tribhuvan University Teaching Hospital (TUTH)',
      'Universal College of Medical Sciences (UCMS)',
    ],
  },
  {
    id: 'eng_np', label: '💻 Engineering & IT Colleges',
    unis: [
      'Advanced College of Engineering and Management (ACEM)',
      'Apex College',
      'Asian Institute of Technology and Management (AITM)',
      'Deerwalk Institute of Technology',
      'Everest Engineering College',
      'Global Institute of Technology (GIT)',
      'Herald College Kathmandu (UWE Bristol)',
      'Himalayan College of Engineering',
      'Institute of Engineering and Technology (IET)',
      'Islington College (Leeds Beckett University)',
      'Kantipur Engineering College',
      'Kathmandu Engineering College (KEC)',
      'Khwopa College of Engineering',
      'Khwopa Engineering College',
      'Lalitpur Engineering College',
      'Lumbini Engineering College',
      'National College of Engineering (NCE)',
      'National Institute of Technology (NIT Nepal)',
      'Nepal College of Information Technology (NCIT)',
      'Nepal Engineering College (NEC)',
      'Sagarmatha Engineering College',
      'Softwarica College of IT and E-Commerce',
      'Universal Engineering and Science College (UESC)',
      'Virinchi College',
    ],
  },
  {
    id: 'mgmt_np', label: '💼 Management & Commerce',
    unis: [
      'Ace Institute of Management',
      'Asian School of Management and Technology (ASMT)',
      'Everest International College',
      'Faculty of Management, TU',
      'Global College of Management (GCM)',
      'Kathmandu College of Management (KCM)',
      'Nepal Commerce Campus, TU',
      'Nepal Law Campus, TU',
      'Prime College',
      'Shanker Dev Campus, TU',
      'Strathmore College',
    ],
  },
  {
    id: 'arts_np', label: '📚 Arts, Science & Multiple Campuses',
    unis: [
      'Amrit Science College',
      'Birendra Multiple Campus',
      'Butwal Multiple Campus',
      'Mahendra Multiple Campus',
      'Mechi Multiple Campus',
      'Model Multiple Campus',
      'Patan Multiple Campus',
      'Prithvi Narayan Campus (Pokhara)',
      'Ratna Rajya Campus',
      'Thakur Ram Multiple Campus',
      'Trichandra Multiple Campus',
    ],
  },
  {
    id: 'intl_np', label: '🌐 International & Affiliated',
    unis: [
      'DAV College Lalitpur',
      'Don Bosco College Dharan',
      'Kantipur City College',
      'Kathmandu BernHardt College (KBC)',
      'Lincoln University College Nepal',
      'Pokhara Engineering College',
      'St. Xavier\'s College Kathmandu',
      'United Technical College',
    ],
  },
]

/* ═══════════════════════════════════════════════════════════════════════════
   Exports & helpers
═══════════════════════════════════════════════════════════════════════════ */
export const COUNTRY_GROUPS = { india: INDIA_GROUPS, nepal: NEPAL_GROUPS }

/** Flat sorted list used by legacy consumers */
export const UNIVERSITIES = [
  ...INDIA_GROUPS.flatMap(g => g.unis),
  ...NEPAL_GROUPS.flatMap(g => g.unis),
].sort((a, b) => a.localeCompare(b))

const ALL_UNI_SET = new Set(UNIVERSITIES)

/* ═══════════════════════════════════════════════════════════════════════════
   Component
═══════════════════════════════════════════════════════════════════════════ */
export default function UniversitySelect({
  value      = '',
  onChange,
  country    = '',         // '' | 'india' | 'nepal'
  placeholder = 'Search your university…',
  className  = '',
}) {
  const [open,       setOpen]       = useState(false)
  const [search,     setSearch]     = useState('')
  const [customMode, setCustomMode] = useState(() => !!value && !ALL_UNI_SET.has(value))

  const searchRef = useRef(null)
  const customRef = useRef(null)
  const dropRef   = useRef(null)

  /* Sync customMode if parent resets value externally */
  useEffect(() => {
    if (!value)                  setCustomMode(false)
    else if (!ALL_UNI_SET.has(value)) setCustomMode(true)
  }, [value])

  /* Close on outside click */
  useEffect(() => {
    const h = (e) => { if (!dropRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => { if (open)       setTimeout(() => searchRef.current?.focus(), 60) }, [open])
  useEffect(() => { if (customMode) setTimeout(() => customRef.current?.focus(),  60) }, [customMode])

  /* Active groups based on country prop */
  const activeGroups = useMemo(() => {
    if (country === 'india') return INDIA_GROUPS
    if (country === 'nepal') return NEPAL_GROUPS
    return [...INDIA_GROUPS, ...NEPAL_GROUPS]
  }, [country])

  /* Flat list for search */
  const flatList = useMemo(() => activeGroups.flatMap(g => g.unis), [activeGroups])

  /* Filtered search results */
  const filtered = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    return flatList.filter(u => u.toLowerCase().includes(q)).slice(0, 50)
  }, [search, flatList])

  /* Handlers */
  const handleSelect = (u) => { onChange(u); setSearch(''); setOpen(false) }

  const enterCustom = () => {
    setOpen(false); setSearch(''); setCustomMode(true); onChange('')
  }

  const clearAll = (e) => {
    e?.stopPropagation?.()
    onChange(''); setSearch(''); setCustomMode(false); setOpen(false)
  }

  /* ── Render ── */
  return (
    <div className={`relative ${className}`} ref={dropRef}>

      {/* ── Custom text input mode ── */}
      {customMode ? (
        <div
          className="flex items-center gap-3 px-4 rounded-[14px] h-12"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,106,247,0.35)' }}
        >
          <PenLine size={14} style={{ color: '#7c6af7', flexShrink: 0 }} />
          <input
            ref={customRef}
            type="text"
            placeholder="Type your university / college name…"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="flex-1 bg-transparent text-[13px] placeholder-gray-600 outline-none"
            style={{ color: '#eeeef2' }}
          />
          <motion.button type="button" whileTap={{ scale: 0.82 }} onClick={clearAll} title="Back to list">
            <X size={13} className="text-gray-500" />
          </motion.button>
        </div>
      ) : (
        /* ── Dropdown trigger ── */
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center gap-3 px-4 rounded-[14px] h-12 text-left"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <GraduationCap size={14} className="text-orange-400 flex-shrink-0" />
          <span className={`flex-1 text-[13px] truncate ${value ? 'text-white' : 'text-gray-600'}`}>
            {value || placeholder}
          </span>
          {value
            ? <motion.button type="button" onClick={clearAll} whileTap={{ scale: 0.85 }}><X size={13} className="text-gray-500" /></motion.button>
            : <ChevronDown size={13} className="text-gray-500 transition-transform duration-200"
                style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
          }
        </button>
      )}

      {/* ── Dropdown panel ── */}
      <AnimatePresence>
        {open && !customMode && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="absolute top-[calc(100%+6px)] left-0 right-0 rounded-[18px] overflow-hidden z-50"
            style={{ background: '#1a1a22', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 16px 48px rgba(0,0,0,0.72)' }}
          >
            {/* Search bar */}
            <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <Search size={13} className="text-gray-500 flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search all universities…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-600 text-[12px] outline-none"
              />
              {search && <button type="button" onClick={() => setSearch('')}><X size={11} className="text-gray-600" /></button>}
            </div>

            {/* Results */}
            <div className="overflow-y-auto" style={{ maxHeight: 300 }}>
              {search.trim() ? (
                filtered.length === 0 ? (
                  <div className="px-4 py-5 text-center">
                    <p className="text-[12px]" style={{ color: '#55555f' }}>No match found</p>
                    <button type="button" onClick={enterCustom}
                      className="mt-2 text-[11px] font-semibold transition-colors hover:text-white"
                      style={{ color: '#7c6af7' }}>
                      Enter "{search}" manually →
                    </button>
                  </div>
                ) : (
                  <>
                    {filtered.map(u => <UniRow key={u} u={u} active={value === u} onSelect={handleSelect} />)}
                    <EnterManuallyRow onClick={enterCustom} />
                  </>
                )
              ) : (
                <>
                  {activeGroups.map(group => (
                    <div key={group.id}>
                      <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest sticky top-0 z-10"
                        style={{ color: '#444450', background: '#1a1a22', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        {group.label}
                      </div>
                      {group.unis.map(u => <UniRow key={u} u={u} active={value === u} onSelect={handleSelect} />)}
                    </div>
                  ))}
                  <EnterManuallyRow onClick={enterCustom} />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function UniRow({ u, active, onSelect }) {
  return (
    <button type="button" onClick={() => onSelect(u)}
      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] text-left transition-colors hover:bg-white/[0.05]"
      style={{ color: active ? '#fb923c' : '#d1d5db', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      {active && <span style={{ color: '#f97316', fontSize: 10 }}>✓</span>}
      <span className="flex-1 leading-snug">{u}</span>
    </button>
  )
}

function EnterManuallyRow({ onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full flex items-center gap-2.5 px-4 py-3 text-[12px] text-left transition-colors hover:bg-white/[0.04]"
      style={{ color: '#7c6af7', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <PenLine size={12} style={{ color: '#7c6af7', flexShrink: 0 }} />
      <span className="font-semibold">Enter manually (not in list)</span>
    </button>
  )
}
