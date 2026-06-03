const router = require('express').Router()
const User = require('../models/User')
const Product = require('../models/Product')

// POST /api/seed — populate demo data (dev only)
router.post('/', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Seed disabled in production' })
  }
  try {
    await Product.deleteMany({})
    await User.deleteMany({ email: { $regex: /@demo\.nextowner\.com$/ } })

    const universities = ['IIT Delhi', 'IIT Bombay', 'BITS Pilani', 'VIT Vellore', 'Manipal University', 'NIT Trichy', 'IIIT Hyderabad', 'Amity University']
    const demoUsers = await User.insertMany([
      { name: 'Rahul Kumar', email: 'rahul@demo.nextowner.com', password: 'demo1234', university: 'IIT Delhi', isVerified: true, verificationStatus: 'verified' },
      { name: 'Priya Sharma', email: 'priya@demo.nextowner.com', password: 'demo1234', university: 'BITS Pilani', isVerified: true, verificationStatus: 'verified' },
      { name: 'Amit Rajan', email: 'amit@demo.nextowner.com', password: 'demo1234', university: 'VIT Vellore', isVerified: false },
      { name: 'Sneha Mehta', email: 'sneha@demo.nextowner.com', password: 'demo1234', university: 'Manipal University', isVerified: true, verificationStatus: 'verified' },
    ])

    const imgs = {
      airpods: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&q=80'],
      macbook: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80'],
      cycle: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'],
      watch: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80'],
      camera: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80'],
      books: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80'],
      fridge: ['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80'],
      laptop: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80'],
      earbuds: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80'],
      table: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80'],
      phone: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80'],
      shoes: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'],
    }

    await Product.insertMany([
      { title: 'AirPods Pro 2nd Gen', description: 'Used for 3 months. Excellent condition with all accessories. Active noise cancellation working perfectly.', price: 6999, category: 'Electronics', images: imgs.airpods, seller: demoUsers[0]._id, university: 'IIT Delhi', location: 'Hostel Block A', condition: 'Like New', featured: true },
      { title: 'MacBook Air M1 (2020)', description: 'Selling due to upgrade. 8GB RAM, 256GB SSD. No scratches, battery health 91%.', price: 45000, category: 'Electronics', images: imgs.macbook, seller: demoUsers[1]._id, university: 'BITS Pilani', location: 'Campus', condition: 'Good', featured: true },
      { title: 'Hero Cycle MTB 26"', description: 'Mountain bike, good for campus commute. Gears working fine. New tyres fitted.', price: 4200, category: 'Vehicles', images: imgs.cycle, seller: demoUsers[2]._id, university: 'VIT Vellore', location: 'Boys Hostel', condition: 'Good', featured: true },
      { title: 'Apple Watch SE (44mm)', description: 'GPS model, space grey. Charger included. Small scuff on one side.', price: 10500, category: 'Electronics', images: imgs.watch, seller: demoUsers[3]._id, university: 'Manipal University', location: 'Room 204', condition: 'Good' },
      { title: 'Canon EOS 200D Camera', description: '18-55mm kit lens included. 2 batteries + bag. Perfect for photography beginners.', price: 28000, category: 'Electronics', images: imgs.camera, seller: demoUsers[1]._id, university: 'BITS Pilani', location: 'Media Block', condition: 'Good' },
      { title: 'Engineering Books Set (3rd Year CSE)', description: 'OS, DBMS, CN, DSA full set. No torn pages. Very clean condition.', price: 1500, category: 'Books', images: imgs.books, seller: demoUsers[0]._id, university: 'IIT Delhi', location: 'Academic Block', condition: 'Good' },
      { title: 'Mini Refrigerator 50L', description: 'Perfect for hostel room. Working great. Selling because leaving hostel.', price: 5500, category: 'Appliances', images: imgs.fridge, seller: demoUsers[2]._id, university: 'VIT Vellore', location: 'Hostel 7', condition: 'Good' },
      { title: 'Dell Inspiron 15 Laptop', description: 'i5 11th gen, 8GB RAM, 512GB SSD. Minor dents but fully functional. Charger included.', price: 32000, category: 'Electronics', images: imgs.laptop, seller: demoUsers[3]._id, university: 'Manipal University', location: 'Hostel C', condition: 'Fair' },
      { title: 'Sony WF-1000XM4 Earbuds', description: 'Premium noise cancelling earbuds. Bought 6 months ago. All accessories included.', price: 8999, category: 'Electronics', images: imgs.earbuds, seller: demoUsers[1]._id, university: 'BITS Pilani', location: 'Campus', condition: 'Like New', featured: true },
      { title: 'Study Table with Bookshelf', description: 'Solid wood table with attached bookshelf. Good for hostel room. Easy to assemble.', price: 3500, category: 'Furniture', images: imgs.table, seller: demoUsers[0]._id, university: 'IIT Delhi', location: 'Faculty Block', condition: 'Good' },
      { title: 'iPhone 12 (128GB)', description: 'Blue colour. Face ID works. Battery health 85%. No physical damage.', price: 22000, category: 'Electronics', images: imgs.phone, seller: demoUsers[2]._id, university: 'VIT Vellore', location: 'Girls Hostel', condition: 'Good', featured: true },
      { title: 'Nike Air Force 1 (Size 9)', description: 'Worn twice. Original box included. Too big for me.', price: 3800, category: 'Fashion', images: imgs.shoes, seller: demoUsers[3]._id, university: 'Manipal University', location: 'Sports Complex', condition: 'Like New' },
    ])

    res.json({ message: 'Demo data seeded successfully', users: demoUsers.length })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
