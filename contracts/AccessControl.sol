// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EventHorizonAccessControl
 * @notice Smart contract for role-based access control to sensitive documents
 * @dev Implements immutable blockchain rules for document access
 */
contract EventHorizonAccessControl {
    // Role enum
    enum Role {
        FOUNDER,
        ENGINEER,
        MARKETING
    }

    // Access types
    enum AccessType {
        FULL,
        PARTIAL,
        SEMANTIC,
        DENIED
    }

    // Structure to store user roles
    mapping(address => Role) public userRoles;
    
    // Owner of the contract
    address public owner;

    // Events
    event RoleAssigned(address indexed user, Role role);
    event AccessVerified(address indexed user, string field, AccessType accessType);

    // Constructor
    constructor() {
        owner = msg.sender;
        // Set contract deployer as founder by default
        userRoles[msg.sender] = Role.FOUNDER;
    }

    // Modifier to check if caller is owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /**
     * @notice Assign a role to a user
     * @param user The address to assign the role to
     * @param role The role to assign
     */
    function assignRole(address user, Role role) external onlyOwner {
        require(user != address(0), "Invalid user address");
        userRoles[user] = role;
        emit RoleAssigned(user, role);
    }

    /**
     * @notice Get the role of a user
     * @param user The address to check
     * @return The user's role
     */
    function getUserRole(address user) external view returns (Role) {
        return userRoles[user];
    }

    /**
     * @notice Check access level for a field based on role
     * @param fieldIndex The index of the field (0: revenue, 1: risks, 2: roadmap, 3: marketSize)
     * @return accessType The type of access allowed
     */
    function checkFieldAccess(address user, uint8 fieldIndex) external view returns (AccessType) {
        Role userRole = userRoles[user];

        // Founder has full access to all fields
        if (userRole == Role.FOUNDER) {
            return AccessType.FULL;
        }

        // Engineer access rules
        if (userRole == Role.ENGINEER) {
            if (fieldIndex == 0) return AccessType.PARTIAL; // revenue: partial
            if (fieldIndex == 1) return AccessType.DENIED;  // risks: denied
            if (fieldIndex == 2) return AccessType.FULL;    // roadmap: full
            if (fieldIndex == 3) return AccessType.FULL;    // marketSize: full
        }

        // Marketing access rules
        if (userRole == Role.MARKETING) {
            if (fieldIndex == 0) return AccessType.PARTIAL;  // revenue: partial
            if (fieldIndex == 1) return AccessType.SEMANTIC; // risks: semantic masking
            if (fieldIndex == 2) return AccessType.FULL;     // roadmap: full
            if (fieldIndex == 3) return AccessType.FULL;     // marketSize: full
        }

        return AccessType.DENIED;
    }

    /**
     * @notice Verify access and emit event
     * @param fieldIndex The index of the field
     */
    function verifyAndLogAccess(uint8 fieldIndex) external {
        AccessType accessType = this.checkFieldAccess(msg.sender, fieldIndex);
        string memory fieldName;
        
        if (fieldIndex == 0) fieldName = "revenue";
        else if (fieldIndex == 1) fieldName = "risks";
        else if (fieldIndex == 2) fieldName = "roadmap";
        else if (fieldIndex == 3) fieldName = "marketSize";
        else revert("Invalid field index");

        emit AccessVerified(msg.sender, fieldName, accessType);
    }
}
