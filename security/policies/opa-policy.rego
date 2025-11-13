package ex_platform.authz

import rego.v1

default allow := false

# Allow if user is admin
allow if {
    input.user.role == "admin"
}

# Allow if user owns the resource
allow if {
    input.user.id == input.resource.owner_id
}

# Allow if user has the required permission
allow if {
    perm := input.resource.required_permission
    perm in input.user.permissions
}

# Deny access to sensitive resources outside business hours
deny if {
    input.resource.sensitive == true
    not business_hours
}

business_hours if {
    hour := time.clock(input.time)[0]
    hour >= 9
    hour < 17
}

