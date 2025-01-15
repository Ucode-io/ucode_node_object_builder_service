1. Node Object Builder{
    1. Person Fields : {
        1. Full_name,       done
        2. Date of Birth,   done
        3. Email,           done
        4. Phone,           done
        5. Login,           done
        6. Password,        done
        7. Image,           done
        8. Gender           done
    };

    2. Person Relation : {
        1. Client Type,     done
        2. Role             done
    }

    3. When create row in login table it 
    should created in person table too. And should sync with auth

    4. When created row in person table it should be created on login table. And should be sync with auth

    5. When create client_type login table should be create automaticly(with all login_strategy)

    6. Write the script to create fields, relations and permissions
}