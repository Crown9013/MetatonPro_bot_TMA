import React from "react";

interface Props {
  progress: number
}

const ProgressBar = ({progress}:Props) => {
    
    const Childdiv = {
      height: '100%',
      width: `${Number(progress)  > 100 ? 100 : progress}%`,
    }
     
    return (
    <div className="relative h-4 flex-1 rounded-full bg-[#292829]">
      <div style={Childdiv} className={`absolute bottom-0 left-0 top-0 rounded-full bg-[linear-gradient(_#F181E6_0%,_#3CF9FB_100%)]`}>
      </div>
    </div>
    )
}
 
export default ProgressBar;