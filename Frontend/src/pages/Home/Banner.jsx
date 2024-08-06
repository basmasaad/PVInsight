import React from "react";
import { Carousel } from "flowbite-react";

import banner from "../../assets/banner.png"

import { Link } from 'react-router-dom';


const Banner = () => {
  return (
    // <div className=" bg-neutralSilver" id="home"><br /><br /><br /><br /><br /><br />
    //   <div className="px-4 lg:px-14 max-w-screen-2xl mx-auto min-h-1/2-screen h-screen flex justify-center items-center">
    //     <Carousel className="w-full mx-auto">
    //       <div className="my-28 md:my-8 py-12 flex flex-col w-full mx-auto md:flex-row-reverse items-center justify-between gap-12">
    //         <div>
    //           <img src={banner} alt="" />
    //         </div>
    //         <div className="md:w-1/2">
    //           <h1 className="text-3xl mb-4 font-semibold text-neutralDGrey md:w-3/4 leading-snug">Explore your Data & Predict you Energy: <span className="text-brandPrimary leading-snug">Advanced Data Exploration, Data Preprocessing, Model Learning & Predictions Analysis</span></h1>
    //           <button className="px-7 py-2 bg-brandPrimary text-white rounded hover:bg-neutralDGrey mr-4">Register</button>
    //           <button className="px-7 py-2 bg-brandPrimary text-white rounded hover:bg-neutralDGrey">Log-In</button>

    //         </div>
    //       </div>

    //     </Carousel>
    //   </div>
    // </div>
    <div className="bg-neutralSilver" id="home">
      <div className="px-3 lg:px-14 max-w-screen-2xl mx-auto h-96 flex justify-center items-center">
        <Carousel className="w-full mx-auto">
          <div className="py-12 flex flex-col w-full mx-auto md:flex-row-reverse items-center justify-between gap-12">
            <div>
              <img src={banner} alt="" />
            </div>
            <div className="md:w-1/2">
              <h1 className="text-3xl mb-4 font-semibold text-neutralDGrey md:w-3/4 leading-snug">
                Explore your Data & Predict your Energy: <span className="text-brandPrimary leading-snug">Advanced Data Exploration, Data Preprocessing, Model Learning & Predictions Analysis</span>
              </h1>
              <div className="flex space-x-4">
                <button className="px-7 py-2 bg-brandPrimary text-white rounded hover:bg-neutralDGrey">Register</button>
                <button className="px-7 py-2 bg-brandPrimary text-white rounded hover:bg-neutralDGrey">Log-In</button>
              </div>
            </div>
          </div>
        </Carousel>
      </div>
    </div>
  );
};

export default Banner;
