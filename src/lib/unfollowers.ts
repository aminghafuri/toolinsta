interface InstagramUser {
    string_list_data: {
        value: string;
        timestamp: number;
        href?: string;
    }[];
}

export function findUnfollowers(followersData: InstagramUser[], followingData: InstagramUser[]) {
    // Find the lowest (earliest) timestamp in followers data
    const followersTimestamps = followersData
        .map(user => user.string_list_data[0].timestamp)
        .filter(timestamp => timestamp && timestamp > 0);
    
    const lowestFollowersTimestamp = followersTimestamps.length > 0 
        ? Math.min(...followersTimestamps) 
        : 0;
    
    // Filter following data to only include entries from the lowest followers timestamp onwards
    const filteredFollowingData = followingData.filter(user => {
        const userTimestamp = user.string_list_data[0].timestamp;
        return userTimestamp && userTimestamp >= lowestFollowersTimestamp;
    });
    
    const followersSet = new Set(followersData.map(user => user.string_list_data[0].value));
    
    // Create unfollowers with their profile links using filtered following data
    const unfollowers = filteredFollowingData
        .filter(user => !followersSet.has(user.string_list_data[0].value))
        .map(user => ({
            username: user.string_list_data[0].value,
            href: user.string_list_data[0].href,
            timestamp: user.string_list_data[0].timestamp
        }));

    return {
        unfollowers,
        totalFollowing: followingData.length,
        filteredFollowing: filteredFollowingData.length,
        lowestFollowersTimestamp,
        dateFilterApplied: lowestFollowersTimestamp > 0
    };
}
