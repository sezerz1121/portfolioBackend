import path from 'path';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Project } from "../models/project.models.js";
import { Message } from '../models/message.models.js';
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from '../utils/emailUtil.js';
import dotenv from "dotenv";

dotenv.config();

const projectListing = asyncHandler(async (req, res) => {
    const {
        projectImageOne,
        projectImageTwo,
        projectImageThree,
        projectImageFour,
        projectName,
        projectFeature,
        projectLink,
    } = req.body;

    

    const existedProject = await Project.findOne({ projectName });

    if (existedProject) {
        throw new ApiError(409, "Project already exists");
    }

    const projectImageOneLocalPath = req.files?.projectImageOne?.[0]?.path;
    const projectImageTwoLocalPath = req.files?.projectImageTwo?.[0]?.path;
    const projectImageThreeLocalPath = req.files?.projectImageThree?.[0]?.path;
    const projectImageFourLocalPath = req.files?.projectImageFour?.[0]?.path;

    console.log('projectImageOneLocalPath:', projectImageOneLocalPath);
    console.log('projectImageTwoLocalPath:', projectImageTwoLocalPath);
    console.log('projectImageThreeLocalPath:', projectImageThreeLocalPath);
    console.log('projectImageFourLocalPath:', projectImageFourLocalPath);

    if (!projectImageOneLocalPath) {
        throw new ApiError(400, "Product image file is required");
    }

    // Normalize paths for cross-platform compatibility
    const normalizedPathOne = path.normalize(projectImageOneLocalPath);
    const normalizedPathTwo = projectImageTwoLocalPath ? path.normalize(projectImageTwoLocalPath) : null;
    const normalizedPathThree = projectImageThreeLocalPath ? path.normalize(projectImageThreeLocalPath) : null;
    const normalizedPathFour = projectImageFourLocalPath ? path.normalize(projectImageFourLocalPath) : null;

    const projectImageOneUpload = await uploadOnCloudinary(normalizedPathOne);
    const projectImageTwoUpload = normalizedPathTwo ? await uploadOnCloudinary(normalizedPathTwo) : null;
    const projectImageThreeUpload = normalizedPathThree ? await uploadOnCloudinary(normalizedPathThree) : null;
    const projectImageFourUpload = normalizedPathFour ? await uploadOnCloudinary(normalizedPathFour) : null;

    // Adjust the creation of categoryArray to match the expected structure
    const categoryArray = projectFeature.split(',').map(cat => ({ feature: cat.trim() }));

    const project = await Project.create({
        projectImageOne: projectImageOneUpload.secure_url,
        projectImageTwo: projectImageTwoUpload?.secure_url || null,
        projectImageThree: projectImageThreeUpload?.secure_url || null,
        projectImageFour: projectImageFourUpload?.secure_url || null,
        projectName,
        projectFeature: categoryArray,
        projectLink
    });

    const newProject = await Project.findById(project._id);
    if (!newProject) {
        throw new ApiError(500, "Something went wrong");
    }

    return res.status(201).json(
        new ApiResponse(200, newProject, "New project listed successfully")
    );
});



const projectAll = asyncHandler(async (req, res) => {
    const projects = await Project.find(); 
    res.json(projects);
});

const messageCreation = asyncHandler(async (req, res) => {
    const { name, email, message } = req.body;

    if (!name) {
        throw new ApiError(400, "name is required");
    }
    if (!email) {
        throw new ApiError(400, "email is required");
    }
    if (!message) {
        throw new ApiError(400, "message is required");
    }

    const newMessage = await Message.create({ name, email, message });
    const createdMessage = await Message.findById(newMessage._id);

    if (!createdMessage) {
        throw new ApiError(500, "Something went wrong");
    }

    // Prepare email options
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: 'tatsam242005@gmail.com',
        subject: 'New Message Received',
        text: message,
        html: `<h1>${name}</h1><b>${message}</b>`,
    };

    // Send the email
    try {
        await sendEmail(mailOptions);
        
    } catch (error) {
        console.error('Error sending email:', error);
    }

    return res.status(201).json(
        new ApiResponse(200, createdMessage, "New message listed successfully")
    );
});

export { projectListing,projectAll,messageCreation };
