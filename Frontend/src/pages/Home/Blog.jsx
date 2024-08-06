import { Card } from 'flowbite-react';
import React from 'react';

// motion
import { motion } from "framer-motion";
// variants
import { fadeIn } from "../../variants";

const Blog = () => {
    const blogs = [
        {id: 2, title: "Reasearchers the ability to customize the preprocessing of their data.", image: "/src/assets/dash3.jpeg"},
        {id: 3, title: "We provide users with visualization tools to facilitate their decision-making process.", image: "/src/assets/dash2.jpeg"},
        {id: 4, title: "We offer users high-performance, custumized and ready to use models to help them make strategic and informed decisions.", image: "/src/assets/dash1.jpeg"}
    ];
    return (
        <div  className='px-4 lg:px-14 max-w-screen-2xl mx-auto my-12' id='faq'>
            <motion.div
            variants={fadeIn("left", 0.2)}
            initial="hidden"
            whileInView={"show"}
            viewport={{ once: false, amount: 0.6 }}
            
            className='text-center md:w-1/3 mx-auto'>
            <h2 className="text-4xl text-neutralDGrey font-semibold mb-4">Our Solutions</h2>
           
            </motion.div>

            {/* all blogs */}
            <motion.div 
            variants={fadeIn("right", 0.3)}
            initial="hidden"
            whileInView={"show"}
            viewport={{ once: false, amount: 0.6 }}
            
            className='grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8 items-center justify-between mt-16'>
                {
                    blogs.map( blog => <div key={blog.id} className='mx-auto relative mb-12 cursor-pointer'>
                       <img src={blog.image} alt="" className='mx-auto hover:scale-95 transition-all duration-300'  style={{ borderRadius: '10px', width: '350px', height: '350px' }}/>
                       
                        <div className='text-center px-4 py-8 bg-white shadow-lg rounded-md md:w-3/4 mx-auto absolute -bottom-12 left-0 right-0'>
                            <h3 className='mb-3 text-neutralGrey font-semibold'>{blog.title}</h3>
                            
                        </div>
                    </div>)
                }
            </motion.div>

        </div>
    );
};

export default Blog;