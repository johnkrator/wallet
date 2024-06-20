import axios from "axios";

interface BlacklistCheckResponse {
    isBlacklisted: boolean;
}

export const checkBlacklist = async (email: string, phoneNumber: string): Promise<boolean> => {
    try {
        // Make a request to the Lendsqr Adjutor Karma API to check if the users is blacklisted
        const emailResponse = await axios.get<BlacklistCheckResponse>(`https://adjutor.lendsqr.com/karma/blacklist/check?email=${email}`, {
            headers: {
                "Authorization": `Bearer ${process.env.LENDSQR_API_KEY}`,
            },
        });

        const phoneNumberResponse = await axios.get<BlacklistCheckResponse>(`https://adjutor.lendsqr.com/karma/blacklist/check?phoneNumber=${phoneNumber}`, {
            headers: {
                "Authorization": `Bearer ${process.env.LENDSQR_API_KEY}`,
            },
        });

        // If either the email or phone number is blacklisted, return true
        return emailResponse.data.isBlacklisted || phoneNumberResponse.data.isBlacklisted;
    } catch (error) {
        console.error("Error checking blacklist:", error);
        // In case of an error, assume the users is not blacklisted
        return false;
    }
};
