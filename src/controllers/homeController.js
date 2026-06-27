import * as homeModel from '../models/homeModel.js';

export const getData = async (req, res) => {
    try {
        // Interact with the model asynchronously to get data
        const data = await homeModel.fetchData();
        
        res.status(200).json({
            success: true,
            message: 'Data fetched successfully',
            data: data
        });
    } catch (error) {
        console.error("Error in getData controller:", error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching data',
            error: error.message
        });
    }
};
