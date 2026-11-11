# Azure subscription ke resources ko read-only list karta hai

import json
import subprocess   # Python se external command, jaise Azure CLI, run karne ke liye.

from azure.identity import AzureCliCredential     # Azure CLI ki authenticated identity ko Azure SDK mein use karne ke liye.
from azure.mgmt.resource.resources import ResourceManagementClient     # Azure Resource Manager API se subscription ke resources retrieve karne ke liye.


def get_selected_subscription_id() -> str:
    """Azure CLI ke through selected subscription ID ko retrieve karta hai"""

    """
    az.cmd: Windows par Azure CLI executable.
    account show: currently selected Azure account ki details.
    --query id: output mein sirf subscription ID select karo.
    -o tsv: output ko simple text format mein do.
    check=True: command fail hui toh exception raise karo.
    capture_output=True: command ka output Python mein capture karo.
    text=True: output ko bytes ke bajaye text rakho.
    timeout=15: 15 seconds se zyada wait mat karo.
    """
    result = subprocess.run(
        ["az.cmd", "account", "show", "--query", "id","-o", "tsv"],
        check=True,
        capture_output=True,
        text=True,
        timeout=15,
    )

    subscription_id = result.stdout.strip()

    if not subscription_id:
        raise RuntimeError("Azure CLI did not return a subscription ID. Please ensure you are logged in and have a subscription selected.")

    return subscription_id



def list_azure_resources(
        credential,     # Azure se authenticate karne ka method.
        subscription_id: str,   # kis subscription ke resources chahiye.
) -> list[dict[str, str]]:   # dictionaries ki list hai, jismein keys aur values strings hain.
    """Azure subscription ke resources ko list karta hai"""

    client = ResourceManagementClient(
        # Credential batata hai kaun request kar raha hai, 
        # aur subscription ID batati hai kis subscription ko query karna hai.
        credential = credential,
        subscription_id = subscription_id
    )

    resources = []

    for resource in client.resources.list():    # Azure se accessible resources ki listing mangta hai
        resources.append(
            {
                "provider": "azure",
                "name": resource.name or "",  # resource ka naam.
                "type": resource.type or "",  # Azure resource type, jaise storage account ya virtual machine.
                "location": resource.location or "",  # resource ki region
                "resource_id": resource.id or "",   # resource ka full Azure identifier
            }
        )

    return resources


def main() -> None:
    """CLI authentication se resource inventory test karta hai."""

    try:
        credential = AzureCliCredential()

        subscription_id = get_selected_subscription_id()

        resources = list_azure_resources(
            credential = credential,
            subscription_id = subscription_id,
        )

        print(f"Resources found: {len(resources)}")
        print(json.dumps(resources, indent=2))   # dictionaries ko readable JSON text mein convert karta hai

    except Exception as e:
        print(f"Azure inventory failed: {e}")



if __name__ == "__main__":
    main()