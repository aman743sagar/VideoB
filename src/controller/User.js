import { User } from "../models/user.js";
import { Meeting } from "../models/meeting.js";
import httpStatus from 'http-status'
import bcrypt , {hash} from "bcrypt"
import crypto  from 'crypto'




const register=async(req,res)=>{
    const {name, username, password}= req.body


    try {
        const existingUser=await User.findOne({username})
        if(existingUser){
          return res.status(httpStatus.FOUND).json({message:"user already exists"})
        }
        const hasshedPassword=await bcrypt.hash(password, 10)
        const newUser=new User({
            name:name,
            username:username,
            password:hasshedPassword
        })
        await newUser.save();
        res.status(httpStatus.CREATED).json({message:"user register"})


    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"something went wronge"})
    }
}

const login =async (req,res)=>{
    const {username, password}=req.body;
    if (!username || !password) {
         return res.status(400).json({message:"please Provided"})
    }
    try {
        const user=await User.findOne({username});
        if(!user){
            return res.status(httpStatus.NOT_FOUND).json({message:"User Not found"})
        }
        let isPasswordCorrect= await bcrypt.compare(password,user.password)
        if (isPasswordCorrect) {
            let token= crypto.randomBytes(20).toString('hex')
            user.token=token
            await user.save();
            return res.status(httpStatus.OK).json({token: token});
        }else{
            return res.status(httpStatus.UNAUTHORIZED).json({message:"invalid username"})
        }
    } catch (error) {
        return res.status(500).json({message:"something went wrong"})
    }
}
const getUserHistory= async(req,res)=>{
    const {token}= req.query;
    try {
        const user=await User.findOne({token:token})
        const meeting=await Meeting.find({userId:user.username})
        console.log("djdj",meeting);
        res.json(meeting)
    } catch (error) {
        res.json({message:`something went wrong ${error}`})
    }
}

// const addHistory= async (req,res)=>{
//     const {token, meeting_code}=req.body;
//     try {
//         const user= await User.findOne({token:token});
//         const newMeeting=new Meeting({
//             user_id:user.username,
//             meetingCode:meeting_code
//         })
//         await newMeeting.save()
//         console.log(newMeeting);
//         res.status(httpStatus.CREATED).json({message:"Added code to history"})
//     } catch (error) {
//         res.json({message:`something went wrong ${error}`})
//     }
// }

const addHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const user = await User.findOne({ token: token }); // Assuming token is stored in DB (not recommended long-term)
        
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
        }

        const newMeeting = new Meeting({
            userId: user.username, // ✅ match with schema (String)
            meetingCode: meeting_code
        });

        await newMeeting.save();
        console.log(newMeeting);

        res.status(httpStatus.CREATED).json({ message: "Added code to history" });
    } catch (error) {
        res.status(500).json({ message: `something went wrong ${error}` });
    }
};

export {login, register, getUserHistory, addHistory}