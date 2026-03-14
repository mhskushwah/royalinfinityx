import { getContract } from "../blockchain/config";

const safeStringify = (obj, space = 2) => {
  const seen = new WeakSet();
  return JSON.stringify(obj, function (key, value) {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }
    return value;
  }, space);
};

// check if target user is downline
const isDownline = async (contract, currentUserId, targetUserId) => {
  if (currentUserId === targetUserId) return true;

  let user = await contract.userInfo(targetUserId);

  while (Number(user.referrer) !== 0) {
    if (Number(user.referrer) === currentUserId) {
      return true;
    }

    user = await contract.userInfo(Number(user.referrer));
  }

  return false;
};

export const fetchUserTree = async (
  userId,
  depth = 2,
  level = 0,
  startIndex = 0,
  batchSize = 1000
) => {
  try {

    if (typeof userId !== "number" || isNaN(userId) || userId <= 0) {
      alert("Invalid user ID.");
      return null;
    }

    const contract = await getContract();

    // current wallet
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const wallet = accounts[0];

    // get current user id from contract
    const currentUser = await contract.users(wallet);
    const currentUserId = Number(currentUser.id);

    // permission check
    const allowed = await isDownline(contract, currentUserId, userId);

    if (!allowed) {
      alert("❌ You can only view your own or your downline tree.");
      return null;
    }

    const user = await contract.userInfo(userId);

    if (!user || Number(user.id) === 0) {
      alert("User not found.");
      return null;
    }

    const node = {
      name: `ID: ${Number(user.id)}`,
      attributes: {
        Referrer: Number(user.referrer),
        Address: user.wallet || user[0],
        Rank: Number(user.level),
        Start: new Date(Number(user.start) * 1000).toLocaleDateString(),
        Team: Number(user.directTeam),
        TotalTeam: Number(user.totalMatrixTeam),
      },
      level,
      children: [],
    };

    if (depth > 0) {
      let hasMore = true;
      let currentIndex = startIndex;
      let childrenFetched = [];

      while (hasMore) {
        const usersBatch = await contract.getMatrixUsers(
          userId,
          level,
          currentIndex,
          batchSize
        );

        if (usersBatch.length === 0) break;

        for (const u of usersBatch) {
          const childId = Number(u.id);

          const childNode = await fetchUserTree(
            childId,
            depth - 1,
            level + 1
          );

          if (childNode) {
            childrenFetched.push(childNode);
          }
        }

        hasMore = usersBatch.length === batchSize;
        currentIndex += batchSize;
      }

      const maxChildren = 2;

      for (let i = 0; i < maxChildren; i++) {
        if (childrenFetched[i]) {
          node.children.push(childrenFetched[i]);
        } else {
          node.children.push({
            name: "EMPTY",
            attributes: {},
            level: level + 1,
            children: [],
          });
        }
      }
    }

    return node;

  } catch (error) {
    console.error(`Error in fetchUserTree for ID ${userId}:`, safeStringify(error));
    alert("Error loading tree.");
    return null;
  }
};