import os
import datetime
import azure.functions as func
from azure.storage.blob import BlobSasPermissions, generate_blob_sas, BlobServiceClient
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        filename = req.params.get("filename")
        if not filename:
            return func.HttpResponse("Missing filename parameter", status_code=400)

        # Get storage account key from Key Vault
        key_vault_url = os.environ["KEY_VAULT_URL"]
        secret_name = os.environ["STORAGE_KEY_SECRET_NAME"]
        credential = DefaultAzureCredential()
        secret_client = SecretClient(vault_url=key_vault_url, credential=credential)
        storage_key = secret_client.get_secret(secret_name).value

        account_name = os.environ["STORAGE_ACCOUNT"]
        container_name = os.environ["CONTAINER_NAME"]

        # Generate SAS token
        sas_token = generate_blob_sas(
            account_name=account_name,
            container_name=container_name,
            blob_name=filename,
            account_key=storage_key,
            permission=BlobSasPermissions(write=True),
            expiry=datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
        )

        sas_url = f"https://{account_name}.blob.core.windows.net/{container_name}/{filename}?{sas_token}"
        return func.HttpResponse(sas_url)
    
    except Exception as e:
        return func.HttpResponse(f"Error: {str(e)}", status_code=500)
